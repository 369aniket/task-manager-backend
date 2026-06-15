import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  sendEmail,
  emailVarificationMailGenContent,
  forgotPasswordMailGenContent
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            {
            500:
            "something went wrong while generating Access Token"
            }
    );
    }
}

const registerUser = asyncHandler(async (req, res) => {
  const  {email, username, password, role} = req.body

  const exitedUser = await User.findOne({
    $or: [{username}, {email}]
  })

  if(exitedUser){
    throw new ApiError(409, "User with username or email is already exists.", [])
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false
  })

  const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

  user.emailverificationToken = hashedToken
  user.emailverificationExpiry = tokenExpiry

  await user.save({validateBeforeSave: false})

  await sendEmail(
    {
        email: user?.email,
        subject: " Please Verify your Email",
        mailgenContent: emailVarificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`)
    });

   const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken -emailverificationToken -emailverificationExpiry"
    )

    if(!createdUser){
        throw new ApiError(
            500, "Something went wrong while registering a user"
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {user: createdUser},
            "User Registered Successfully and verification email has been sent on your email",
        )
    )
})

const login = asyncHandler(async (req, res) =>{
  const {email, password} = req.body

  if(!email){
    throw new ApiError(400, "Email is required")
  }
 
  const user = await User.findOne({email})

    if(!user){
    throw new ApiError(400, "user does not exist.")
    }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(400, "Invalid credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser =  await User.findById(user._id).select(
        "-password -refreshToken -emailverificationToken -emailverificationExpiry"
    )

    const options ={
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,
          accessToken,
          refreshToken
        },
        "User loged in successfully."
      )
    )
});

const logoutUser = asyncHandler(async (req, res) =>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
          refreshToken: null,
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    new ApiResponse(200, {}, "User logged Out")
  )

})

const getCurrentUser = asyncHandler(async (req, res)=>{
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "Current user is fetched successfully"))
})

const verifyEmail = asyncHandler(async (req, res)=>{
  const { verificationToken } = req.params

  if(!verificationToken){
    throw new ApiError(400, "Email verification Token is missing")
  }

  let hashedToken = crypto
  .createHash("sha256")
  .update(verificationToken)
  .digest("hex")

  const user = await User.findOne({
    emailverificationToken: hashedToken,
    emailverificationExpiry: {$gt: Date.now()}
  })

  if(!user){
    throw new ApiError(400, "Token is Invalid or expired")
  }

  user.emailverificationToken = undefined
  user.emailverificationExpiry = undefined
  user.isEmailVerified = true;
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {isEmailVerified: true},
      "Email is verified"
    )
  )
})

const resendEmailVerification = asyncHandler(async (req, res)=>{
  const user = await User.findById(req.user?._id)

  if(!user){
    throw new ApiError(404, "User not found")
  }

  if(user.isEmailVerified){
    throw new ApiError(409, "email is already Verified")
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
  user.generateTemporaryToken();
  
  user.emailverificationToken = hashedToken
  user.emailverificationExpiry = tokenExpiry

  await user.save({validateBeforeSave: false})

  await sendEmail(
    {
        email: user?.email,
        subject: " Please Verify your Email",
        mailgenContent: emailVarificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        )
    });

    return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Mail has been sent to your email ID"
    ))
})


const refreshAccessToken = asyncHandler(async (req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Access")
  }

  try {
    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedRefreshToken?._id)

    if(!user){
      throw ApiError(401, "Invalid Refresh Token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh Token is Expired")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

   const {accessToken, refreshToken: newRefreshToken} =  await generateAccessAndRefreshToken(user?._id)

   user.refreshToken = newRefreshToken
   await user.save()

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", newRefreshToken, options)
   .json(
    new ApiResponse(
      200,
      {accessToken, refreshToken: newRefreshToken},
      "Access Token Refreshed"
    )
   )
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token")
  }
})

const forgotPasswordRequest = asyncHandler(async (req, res)=>{
  const {email} = req.body

  const user = await User.findOne({email})

  if(!user){
    throw new ApiError(404, "User does not exists.", [])
  }

  const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

 

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

   await user.save({validateBeforeSave: false})

   await sendEmail(
    {
        email: user?.email,
        subject: "Password Reset request",
        mailgenContent: forgotPasswordMailGenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
        )
    });

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password Reset mail has been sent on your email"
      )
    )

})

const resetForgotPassword = asyncHandler(async (req, res)=>{
    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")


      const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
      })

      if(!user){
        throw new ApiError(489, "Token is Invalid Or expired")
      }

      user.forgotPasswordToken = undefined
      user.forgotPasswordExpiry = undefined

      user.password = newPassword

      await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,{}, "Password reset successfully."
      )
    )


})

 const changeCurrentPassword = asyncHandler(async (req, res)=>{
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordValid){
    throw new ApiError(400, 'Invalid Old Password')
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password Changed Successfully"
      )
    )
 })


export {
  registerUser, 
  login, 
  logoutUser, 
  verifyEmail, 
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
  getCurrentUser 
};