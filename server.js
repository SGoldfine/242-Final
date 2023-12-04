const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "project/images" });

mongoose
    .connect("mongodb+srv://sgold3:DUmN5HAYWIug0uWd@cluster0.ftlk3p6.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to mongodb!")
    })
    .catch((error) => console.log("Couldn't connect to mongodb!", error));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/project/index.html");
});

const projectSchema = new mongoose.Schema({
    name:String,
    link:String,
    img:String,
    description:[String]
});

const Project = mongoose.model("Project", projectSchema);

app.get("/api/projects", (req, res) => {
    getProjects(res);
});

const getProjects = async (res) => {
    const projects = await Project.find();
    res.send(projects);
}

app.post("/api/projects", upload.single("img"), (req, res) => {
    const result = validateProject(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const project = {
        name: req.body.name,
        link: req.body.link,
        description: req.body.description.split(",")
    }

    if (req.file) {
        project.img = "project/images/" + req.file.filename;
    }

    createProject(project, res);
});

const createProject = async (res, project) => {
    const result = await project.save();
    res.send(project);
};

app.put("/api/projects/:id", upload.single("img"), (req, res) => {
    const result = validateProject(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateProject(req, res);
});

const updateProject = async (req, res) => {
    let fieldsToUpdate = {
        name: req.body.name,
        link: req.body.link,
        description: req.body.description.split(",")
    };

    if(req.file) {
        fieldsToUpdate.img = "project/images/" + req.file.filename;
    }

    const result = await Project.updateOne({_id: req.params.id}, fieldsToUpdate);
    const project = await Project.findById(req.params.id);
    res.send(project);
};

app.delete("/api/projects/:id", upload.single("img"), (req, res) => {
    removeProject(res, req.params.id);
})

const removeProject = async (res, id) => {
    const project = await Project.findByIdAndDelete(id);
    res.send(project);
}

const validateProject = (project) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        description: Joi.allow(""),
        name: Joi.string().min(3).required(),
        link: Joi.string().min(3).required(),
    });

    return schema.validate(project);
};

app.listen(3001, () => {
    console.log("I'm listening");
});