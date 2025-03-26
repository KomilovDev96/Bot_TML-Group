import mongoose from 'mongoose'

module.exports = start = async () => {
    try {
        await mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URI).then(() => {
            console.log(`Mongoga onlayn ulandik`);
        })
    }
    catch (e) {
        console.log(e)
    }
}