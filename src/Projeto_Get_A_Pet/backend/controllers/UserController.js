const User = require('../models/User')

const bcrypt = require('bcrypt')

const createUserToken = require('../helpers/create-user-token')

module.exports = class UserController {
    static async register(req, res) {
        const {name, email, phone, password, confirmpassword} = req.body

        //Validações
        if(!name){
            return res.status(422).json({ message: "O nome é obrigatório!" })
        }

        if(!email){
            return res.status(422).json({ message: "O email é obrigatório!" })
        }

        if(!phone){
            return res.status(422).json({ message: "O telefone é obrigatório!" })
        }

        if(!password){
            return res.status(422).json({ message: "A senha é obrigatória!" })
        }

        if(!confirmpassword){
            return res.status(422).json({ message: "A confirmação de senha é obrigatória!" })
        }

        if( password !== confirmpassword){
            return res.status(422).json({ message: "A confirmação de senha e a senha devem ser iguais!" })
        }

        //Verifica se o usuário existe
        const userExists = await User.findOne({ email: email })

        if(userExists){
            return res.status(422).json({ message: "Ops, parece que este e-mail já foi utilizado." })
        }

        //Criando senha criptografada
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //Criando o usuário
        const user = new User({
            name, 
            email, 
            phone, 
            password: passwordHash
        })

        try {
            //Salva o user 
            const newUser = await user.save()
            
            //Cria o token do user
            await createUserToken(newUser, req, res)
        }
        catch (error){
            res.status(500).json({ message: error })
        }
    }

    static async login(req, res) {
        const {email, password} = req.body

        //Validações
        if(!email){
            return res.status(422).json({ message: "O email é obrigatório!" })
        }

        if(!password){
            return res.status(422).json({ message: "A senha é obrigatória!" })
        }

        //Verifica se o usuário existe
        const user = await User.findOne({ email: email })

        if(!user){
            return res.status(422).json({ message: "Não há usuário cadastrado com este e-mail." })
        }

        //Verifica se a senha bate
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            return res.status(422).json({ message: "Senha inválida." })
        }

        await createUserToken(user, req, res)
    }
}