//models import
const Pet = require('../models/Pet')

//helpers import
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController {
    //create pet
    static async create(req, res){
        const { name, age, weight, color } = req.body

        const images = req.files

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
        if(images.length === 0){
            return res.status(422).json({ message: "As imagens do pet são obrigatórias!" })
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

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            return res.status(201).json({ 
                message: "Pet cadastrado com sucesso!", 
                pet: newPet 
            })
        } 
        catch (error) {
            return res.status(500).json({ message: error })
        }
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt')

        res.status(200 ).json({
            pets: pets,
        })
    }

    static async getAllUserPets(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

        res.status(200).json({
            pets,
        })
    }

    static async getAllUserAdoptions(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')

        res.status(200).json({
            pets,
        })
    }

    static async getPetById(req, res) {
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            return res.status(422).json({ message: "ID inválido!" })
        }

        const pet = await Pet.findById(id)

        if(!pet){
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        res.status(200).json({
            pet: pet
        })
    }

    static async removePetById(req, res) {
        const id = req.params.id

        //check if id is valid
        if(!ObjectId.isValid(id)){
            return res.status(422).json({ message: "ID inválido!" })
        }

        const pet = await Pet.findById(id)

        //check if pet exists
        if(!pet){
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        //check if pet belongs to user
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            return res.status(422).json({ message: 'Houve um problema na sua solicitação, tente novamente mais tarde!' })
        }

        await Pet.findByIdAndDelete(id)

        res.status(200).json({ message: "Pet removido com sucesso!" })
    }

    static async uploadPet (req, res){
        const id = req.params.id
        const { name, age, weight, color, available } = req.body
        const images = req.files

        const updatedData = {}

        //check if pet exists
        const pet = await Pet.findById(id)
        if(!pet){
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        //check if pet belongs to user
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            return res.status(422).json({ message: 'Houve um problema na sua solicitação, tente novamente mais tarde!' })
        }

        //validations
        if(!name){
            return res.status(422).json({ message: "O nome do pet é obrigatório!" })
        } else{
            updatedData.name = name
        }

        if(!age){
            return res.status(422).json({ message: "A idade do pet é obrigatório!" })
        } else{
            updatedData.age = age
        }
        
        if(!weight){
            return res.status(422).json({ message: "O peso do pet é obrigatório!" })
        } else{
            updatedData.weight = weight
        }
        
        if(!color){
            return res.status(422).json({ message: "A cor do pet é obrigatória!" })
        } else{
            updatedData.color = color
        }
        
        if(images.length === 0){
            return res.status(422).json({ message: "As imagens do pet são obrigatórias!" })
        } else{
            updatedData.images = []
            images.map((image) => {
                updatedData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({ message: "Pet atualizado com sucesso!" })
    } 

    static async schedule(req, res) {
        const id = req.params.id

        //check if pet exists
        const pet = await Pet.findById(id)
        if(!pet){
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        //check if user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user._id)){
            return res.status(422).json({ message: 'Você não pode agendar uma visita com o seu próprio pet!' })
        }

        //check if user has already scheduled a visit
        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                return res.status(422).json({ message: 'Você já agendou uma visita para este Pet!' })
            }
        }

        //add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }
        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({
            message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}.`
        })
    }
}