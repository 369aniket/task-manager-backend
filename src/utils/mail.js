import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options)=> {
   const mailGenerator =  new Mailgen({
        product: {
            name: "Task manager",
            link: "https://taskmanagelink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHtml = mailGenerator.generate(options.mailgenContent)

   const transporter =  nodemailer.createTransport(
        {
            host:process.env.MAILTRAP_SMTP_HOST,
            port:process.env.MAILTRAP_SMTP_PORT,
            auth:{
                user:process.env.MAILTRAP_SMTP_USER,
                pass:process.env.MAILTRAP_SMTP_PASS
            }
        }
)
    const mail = {
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently. make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("Error:", error)
    }
}

const emailVarificationMailGenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we'are excited to have you on board.",
            action:{
                instructions:"To verify your email please click on the following button",
                button:{
                    color:"#22BC66",
                    text: "Verify your Email",
                    link: verificationUrl
                }
            },
            outro:"Need help, or have question? Just replay to this email, we'd love to help."
        }
    }
     
}

const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the Password of your account.",
            action:{
                instructions:"To reset your password click on the following button or link",
                button:{
                    color:"#bc2222ff",
                    text: "Reset Your Password",
                    link: passwordResetUrl
                }
            },
            outro:"Need help, or have question? Just replay to this email, we'd love to help."
        }
    }
     
}

export {
    emailVarificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail
    }