//models import
const Pet = require('../models/Pet')

//helpers import
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class PetController {
    //create pet
    static async create(req, res){
        const { name, age, weight, color } = req.body

        const available = true

        //images upload

        //validations
        if(!name){
            return res.status(422).json({ message: "O nome do pet é obrigatório!" })
        }
        if(!age){
            return res.status(422).json({ message: "A idade do pet é obrigatório!" })
        }
        if(!weight){
            return res.status(422).json({ message: "O peso do pet é obrigatório!" })
        }
        if(!color){
            return res.status(422).json({ message: "A cor do pet é obrigatória!" })
        }

        //get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        //create pet
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })

        try {
            const newPet = await pet.save()
            res.status(201).json({ 
                message: "Pet cadastrado com sucesso!", 
                pet: newPet 
            })
        } 
        catch (error) {
            res.status(500).json({ message: error })
        }
    }
}