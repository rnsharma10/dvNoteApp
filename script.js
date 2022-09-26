const actionMap = {
  "underline-text": "underline",
  "italic-text": "italic",
  "bold-text": "bold",
  "copy-text": "copy",
};

const noteObject = {
  //keeping track of id to generate new id
  latestId: 1,
  noteList: [
    {
      id: "1",
      title: getCurrentTime(),
      lastModified: new Date(),
      content:
        "- Write your note<div>- select and format</div><div>- copy whole note text/selected text or</div><div>- delete note...</div>",
      unFormattedContent:
        "- Write your note, \n- select and format, \n- copy whole note text/selected text or \n- delete note...",
    },
  ],

  //add new notes
  addNewNote: function (id, noteContent, noteContent2) {
    //saving content in 2 format, 1 for editing, 2 for showing on note list
    const newNote = {
      id: id,
      title: getCurrentTime(),
      content: noteContent,
      unFormattedContent: noteContent2, //.replace(/(\r\n|\n|\r)/gm, ""),
    };

    this.noteList.unshift(newNote);
    this.reRenderList();
    return newNote;
  },

  getNote: function (id) {
    const requestedNote = this.noteList.find((note) => note.id == id);
    if (requestedNote) return requestedNote;
    else return null;
  },
  // remove notes
  removeNote: function (id) {
    this.noteList = this.noteList.filter((note) => note.id != id);
    this.reRenderList();
  },

  //update existing note
  updateNote: function (id, noteContent, noteContent2) {
    let index = -1;
    this.noteList.forEach((note) => {
      index += 1;
      // console.log(index);
      if (note.id == id) {
        note.content = noteContent;
        (note.unFormattedContent = noteContent2), //.replace(/(\r\n|\n|\r)/gm, "");
          // console.log(`this is whre change is done ${index}`);
          this.noteList.unshift(...this.noteList.splice(index, 1));
        // console.log(this.noteList);
      }
    });
    this.reRenderList();
  },

  //re-render the note list, ofcourse it will still be hidden if you were editing note
  reRenderList: function () {
    // console.log("rendering list");
    const ulElement = document.getElementById("note-list-ul");
    const childItems = [];
    //recreating children nodes dom elements of note list
    for (let i = 0; i < this.noteList.length; i++) {
      //edit button
      const currentEdit = createDomElement("div", ["edit"], "", "domelement", [
        createDomElement(
          "i",
          "fa-regular fa-pen-to-square note-list-edit".split(" ")
        ),
      ]);
      // delete button
      const currentDelete = createDomElement(
        "div",
        ["delete"],
        "",
        "domelement",
        [
          createDomElement(
            "i",
            "fa-regular fa-trash-can note-list-delete".split(" ")
          ),
        ]
      );
      //title
      const currentTitle = createDomElement(
        "div",
        ["title"],
        "",
        "innerText",
        this.noteList[i].title
      );
      //note header
      const currentHeader = createDomElement(
        "div",
        "noteHeader pd-10".split(" "),
        this.noteList[i].id,
        "domelement",
        [currentTitle, currentEdit, currentDelete]
      );

      //note inner body but partially visible
      const currentInnerNoteDesc = createDomElement(
        "div",
        ["noteInnerDesc"],
        "",
        "innerText",
        this.noteList[i].unFormattedContent.length > 300
          ? this.noteList[i].unFormattedContent.slice(0, 300) + " ..."
          : this.noteList[i].unFormattedContent
      );

      // note body
      const currentNoteDesc = createDomElement(
        "div",
        "noteDesc pd-10".split(" "),
        "",
        "domelement",
        [currentInnerNoteDesc]
      );

      // list element of note
      const currentli = createDomElement("li", [], "", "domelement", [
        currentHeader,
        currentNoteDesc,
      ]);
      // console.log(`print id ${currentEdit.parentNode.parentNode.id}`);
      childItems.push(currentli);
    }
    // resetting note ul and adding li children array
    ulElement.innerHTML = "";
    ulElement.append(...childItems);
    addNoteActions();
  },
};

window.onload = function () {
  // render note list in advance
  noteObject.reRenderList();
  const noteListSection = document.getElementById("note-list-section");
  const noteEditSection = document.getElementById("note-edit-section");
  const noteSaveBtn = document.getElementById("note-save-btn");
  const noteDeleteBtn = document.getElementById("delete-note-btn");
  const fakeTextArea = document.getElementById("fake-textarea");
  const allNotesLink = document.getElementById("all-notes-link");
  const createNoteBtn = document.getElementById("createBtn");

  //create note button
  createNoteBtn.addEventListener("click", () => {
    renderNoteBody();
    showHideEditListDiv("block", "none");

    // noteEditSection.style.display = "block";
    // noteListSection.style.display = "none";
  });

  addNoteActions();

  //save a note, this code will handle both, new note/ existing note
  noteSaveBtn.addEventListener("click", () => {
    // is it new note or existing note
    let currentId = document.getElementsByClassName("noteBody")[0].id;
    // console.log(currentId);
    let noteInfo = ["", 0];
    if (currentId) {
      noteInfo = ["existing", currentId];
    } else {
      noteObject.latestId += 1;
      noteInfo = ["new", noteObject.latestId];
    }

    //if empty note then dont save
    if (!fakeTextArea.innerText || fakeTextArea.innerText.trim().length == 0) {
      showBanner("Empty note!", "error");
      return;
    }

    // save new note
    if (noteInfo[0] == "new") {
      // dont let new empty note get submitted

      const newNote = noteObject.addNewNote(
        noteInfo[1],
        fakeTextArea.innerHTML,
        fakeTextArea.innerText
      );

      renderNoteBody(newNote);
    }
    //update existing note
    else {
      noteObject.updateNote(
        noteInfo[1],
        fakeTextArea.innerHTML,
        fakeTextArea.innerText
      );
    }

    showBanner("Saved!");
  });

  //delete note
  noteDeleteBtn.addEventListener("click", () => {
    let currentId = document.getElementsByClassName("noteBody")[0].id;
    // console.log(currentId);
    if (currentId) {
      noteObject.removeNote(currentId);
      renderNoteBody();
      // showBanner("Note removed.");
      showHideEditListDiv("none", "block");
      // noteEditSection.style.display = "none";
      // noteListSection.style.display = "block";
    } else {
      showBanner("Can't delete new note.", "error");
    }
  });

  // go back to note list
  allNotesLink.addEventListener("click", () => {
    showHideEditListDiv("none", "block");
    // noteEditSection.style.display = "none";
    // noteListSection.style.display = "block";
  });

  //if tab is pressed in note edit field
  fakeTextArea.addEventListener("keydown", (e) => {
    // console.log(e.key);
    if (e.keyCode == 9) {
      e.preventDefault();
      //add tab
      document.execCommand("insertHTML", false, "&#009");
      //prevent focusing on next element
    }
  });

  // note actions
  const actionsBtns = [
    "underline-text",
    "italic-text",
    "bold-text",
    "copy-text",
  ];

  //map note action buttons with events
  actionsBtns.forEach((actionBtn) => {
    const actionBtnObj = document.getElementById(actionBtn);
    actionBtnObj.addEventListener("click", () => {
      if (!fakeTextArea.innerHTML) {
        showBanner("Empty note!", "error");
        return;
      }
      // perform action of bold, italic, underline, copy
      document.execCommand(actionMap[actionBtn]);
      // perform copy action - copy all text if no text is selected
      const selectedText = getSelectedText();
      if (actionBtn == "copy-text" && !selectedText) {
        const range = document.createRange();
        range.selectNodeContents(fakeTextArea);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand(actionMap[actionBtn]);
        sel.removeAllRanges();
      } else if (!selectedText) {
        showBanner(`Please select some text.`, "error");
        return;
      }

      // show banner
      showBanner(`${actionMap[actionBtn]} - done!`);
    });
  });
};

function addNoteActions() {
  // const noteListSection = document.getElementById("note-list-section");
  // const noteEditSection = document.getElementById("note-edit-section");
  Array.prototype.forEach.call(
    document.getElementsByClassName("note-list-edit"),
    (el) => {
      el.addEventListener("click", () => {
        const noteId = el.parentNode.parentNode.id;
        const currentNote = noteObject.getNote(noteId);
        renderNoteBody(currentNote);
        showHideEditListDiv("block", "none");
        // noteEditSection.style.display = "block";
        // noteListSection.style.display = "none";
      });
    }
  );

  Array.prototype.forEach.call(
    document.getElementsByClassName("note-list-delete"),
    (el) => {
      el.addEventListener("click", () => {
        const noteId = el.parentNode.parentNode.id;
        const loadingGif = document.getElementById("loading");
        loadingGif.style.display = "flex";
        setTimeout(() => {
          loadingGif.style.display = "none";
          const currentNote = noteObject.removeNote(noteId);
        }, 300);
      });
    }
  );
}

//create dom element
function createDomElement(
  tag,
  classList = [],
  id = "",
  type = "",
  content = ""
) {
  const element = document.createElement(tag);
  element.classList.add(...classList);
  element.id = id;
  if (type === "innerHTML") {
    element.innerHTML = content;
  } else if (type === "innerText") {
    element.innerText = content;
  } else if (type === "domelement") {
    content.forEach((e) => {
      element.appendChild(e);
    });
    // element.append(...content);
  }
  return element;
}

// get current formatted time in DD/MM/YYYY HH:mm:SS
function getCurrentTime() {
  const currentDate = new Date();
  const currentTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString(
    "en-US",
    { hour12: false }
  )}`;
  return currentTime;
}

//render note body for editing
function renderNoteBody(note = null) {
  const id = note ? note.id : "";
  const title = note ? note.title : "New Note";
  const content = note ? note.content : "";
  document.getElementsByClassName("noteBody")[0].id = id;
  document.getElementsByClassName("noteEditOption")[0].children[1].innerText =
    title;
  const fakeTextArea = document.getElementById("fake-textarea");
  fakeTextArea.innerHTML = content;
  fakeTextArea.scrollTop = 0;
}

// show banner message
function showBanner(actionPerformed, msgType = "info") {
  const bannerElement = document.getElementById("bannerMessage");
  const msgTypeMap = {
    info: "#298c57",
    error: "#912520",
  };
  // show banner message for few miliseconds
  setTimeout(() => {
    bannerElement.innerText = actionPerformed;
    bannerElement.style.color = msgTypeMap[msgType];
  }, 100);
  setTimeout(() => {
    bannerElement.innerText = ``;
    bannerElement.style.color = msgTypeMap[msgType];
  }, 1000);
}

// get selected text from the editing text area
function getSelectedText() {
  const selectedText = window.getSelection();
  return selectedText.toString();
}

// show hide note list or edit note page
function showHideEditListDiv(editDiv, listDiv) {
  const noteListSection = document.getElementById("note-list-section");
  const noteEditSection = document.getElementById("note-edit-section");
  const loadingGif = document.getElementById("loading");
  const fakeTextArea = document.getElementById("fake-textarea");

  loadingGif.style.display = "flex";
  setTimeout(() => {
    noteEditSection.style.display = editDiv;
    noteListSection.style.display = listDiv;
    loadingGif.style.display = "none";
    if (editDiv == "block") {
      fakeTextArea.focus();
    }
  }, 300);
}
