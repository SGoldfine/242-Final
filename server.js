const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
    .connect("mongodb+srv://goldfis:a2aT02kqGMOlrI6v@cluster0.a67urhq.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to mongodb!")
    })
    .catch((error) => console.log("Couldn't connect to mongodb!", error));

const projectSchema = new mongoose.Schema({
    name:String,
    link:String,
    img:String,
    description:[String],
});

const Project = mongoose.model("Project", projectSchema);

/* app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
}); */

app.get("/api/projects", (req, res) => {
    getProjects(res);
});

const getProjects = async (res) => {
    const projects = await Project.find();
    res.send(projects);
}

app.get("/api/projects:id", (req, res) => {
    getProject(res, req.params.id);
});

const getProject = async(res, id) => {
    const project = await Project.findOne({ _id: id });
    res.send(project);
}

app.post("/api/projects", upload.single("img"), (req, res) => {
    const result = validateProject(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const project = new Project({
        name: req.body.name,
        link: req.body.link,
        description: req.body.description.split(","),
    });

    if (req.file) {
        project.img = "images/" + req.file.filename;
    }

    createProject(project, res);
});

const createProject = async (project, res) => {
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
        fieldsToUpdate.img = "images/" + req.file.filename;
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