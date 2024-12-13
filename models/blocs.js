const mongoose = require("mongoose")

const blocsSchema = mongoose.Schema({
    type: String,
    content: String,
    height: Number,
    lineCount: Number, 
    createdAt: { type: Date, index: true },
    updatedAt: { type: Date, index: true },
    language: String,
});

const Bloc = mongoose.model("blocs", blocsSchema);

module.exports = Bloc