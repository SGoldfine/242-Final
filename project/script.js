const toggleNav = () => {
  document.getElementById("main-nav-items").classList.toggle("hidden");
}

const getProjects = async() => {
  try {
      return (await fetch("http://localhost:3001/api/projects")).json();
  } catch (error) {
      console.log(error);
  }
};

const showProjects = async() => {
  let projects = await getProjects();
  let projectsDiv = document.getElementById("project-list");
  projectsDiv.innerHTML = "";
  projects.forEach((project) => {
      const section = document.createElement("section");
      section.classList.add("project");
      projectsDiv.append(section);

      const a = document.createElement("a");
      a.href = "#";
      section.append(a);

      const h3 = document.createElement("h3");
      h3.innerHTML = project.name;
      a.append(h3);

      const img = document.createElement("img");
      img.src = project.img;
      section.append(img);

      a.onclick = (e) => {
          e.preventDefault();
          displayDetails(project);
      };
  });
};

const displayDetails = (project) => {
  const projectDetails = document.getElementById("project-details");
  projectDetails.innerHTML = "";

  const dLink = document.createElement("a");
  dLink.innerHTML = "Delete";
  projectDetails.append(dLink);
  dLink.id = "delete-link";

  const eLink = document.createElement("a");
  eLink.innerHTML = "Edit";
  projectDetails.append(eLink);
  eLink.id = "edit-link";

  const h3 = document.createElement("h3");
  h3.innerHTML = project.name;
  projectDetails.append(h3);

  const link = document.createElement("p");
  projectDetails.append(link);
  link.innerHTML = project.link;

  const ul = document.createElement("ul");
  projectDetails.append(ul);
  console.log(project.description);
  project.description.forEach((desc) => {
      const li = document.createElement("li");
      ul.append(li);
      li.innerHTML = desc;
  });

  eLink.onclick = (e) => {
      e.preventDefault();
      document.querySelector(".dialog").classList.remove("transparent");
      document.getElementById("add-edit-title").innerHTML = "Edit Project";
  };

  dLink.onclick = (e) => {
      e.preventDefault();
      deleteProject(project);
  };

  populateEditForm(project);
};

const deleteProject = async(project) => {
  let response = await fetch(`http://localhost:3001/api/projects${project._id}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json"
      }
  });

  if (response.status != 200) {
      console.log("error deleting");
      return;
  }

  let result = await response.json();
  showProjects();
  document.getElementById("project-details").innerHTML = "";
  resetForm();
}

const populateEditForm = (project) => {
  const form = document.getElementById("add-edit-project-form");
  form._id.value = project._id;
  form.name.value = project.name;
  form.link.value = project.link;
  populateDesc(project)
};

const populateDesc = (project) => {
  const section = document.getElementById("description-boxes");

  project.description.forEach((desc) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = desc;
      section.append(input);
  });
}

const addEditProject = async(e) => {
  e.preventDefault();
  const form = document.getElementById("add-edit-project-form");
  const formData = new FormData(form);
  let response;
  formData.append("description", getDescription());

  if (form._id.value == -1) {
      formData.delete("_id");

      response = await fetch("http://localhost:3001/api/projects", {
          method: "POST",
          body: formData
      });
  } else {
      console.log(...formData);

      response = await fetch(`http://localhost:3001/api/projects/${form._id.value}`, {
          method: "PUT",
          body: formData
      });
  }

  //successfully got data from server
  if (response.status != 200) {
      console.log("Error posting data");
  }

  project = await response.json();

  if (form._id.value != -1) {
      displayDetails(project);
  }

  resetForm();
  document.querySelector(".dialog").classList.add("transparent");
  showProjects();
};

const getDescription = () => {
  const inputs = document.querySelectorAll("#description-boxes input");
  let description = [];

  inputs.forEach((input) => {
    description.push(input.value);
  });

  return description;
}

const resetForm = () => {
  const form = document.getElementById("add-edit-project-form");
  form.reset();
  form._id = "-1";
  document.getElementById("description-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
  e.preventDefault();
  document.querySelector(".dialog").classList.remove("transparent");
  document.getElementById("add-edit-project").innerHTML = "Add Project";
  resetForm();
};

const addDescription = (e) => {
  e.preventDefault();
  const section = document.getElementById("description-boxes");
  const input = document.createElement("input");
  input.type = "text";
  section.append(input);
}

window.onload = () => {
  showProjects();
  document.getElementById("add-edit-project-form").onsubmit = addEditProject;
  document.getElementById("add-link").onclick = showHideAdd;

  document.querySelector(".close").onclick = () => {
      document.querySelector(".dialog").classList.add("transparent");
  };

  document.getElementById("add-description").onclick = addDescription;

  document.getElementById("nav-toggle").onclick = toggleNav;
};