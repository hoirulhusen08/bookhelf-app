// Inisialisasi Variabel
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "BOOK_APP";

// Kode ketika DOM sudah di Load dengan baik
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("formBook");
  const messageSuccess = document.querySelector(".submit-success");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Jalankan fungsi tambah buku
    addBook();
    // Pesan ketika submit data
    if (addBook !== 0) {
      messageSuccess.classList.remove("d-none");
      const message = document.createElement("p");
      message.innerText = "Data buku berhasil ditambahkan!";
      messageSuccess.appendChild(message);
    } else {
      console.log("Data buku gagal ditambahkan");
    }
    // Kosongkan form kembali
    submitForm.reset();
  });

  // Jika di Local Storage ada data ambil
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Fungsi Tambah Buku
function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const image = document.getElementById("image").value;
  const timestamp = document.getElementById("date").value;

  const idBook = generateId();
  const bookObject = generateBookObject(idBook, title, author, image, timestamp, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi Generate ID
function generateId() {
  return +new Date();
}

// Fungsi Generate Objek Buku
function generateBookObject(id, title, author, image, timestamp, isCompleted) {
  return {
    id,
    title,
    author,
    image,
    timestamp,
    isCompleted,
  };
}

// Fungsi membuat Buku
function makeBook(bookObject) {
  const title = document.createElement("h3");
  title.setAttribute("id", "name-book");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("id", "author");
  author.innerText = "Author : " + bookObject.author;

  const timestamp = document.createElement("p");
  timestamp.setAttribute("id", "date-release");
  timestamp.innerText = "Release on : " + bookObject.timestamp;

  const image = document.createElement("img");
  image.setAttribute("alt", "Image");
  image.setAttribute("src", bookObject.image);

  const div = document.createElement("div");
  div.classList.add("card");
  div.classList.add("item-list");
  div.setAttribute("id", `book-${bookObject.id}`);
  div.append(title, author, timestamp, image);

  //   Kondisi menampilkan Icon
  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.setAttribute("title", "Undo Step");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.setAttribute("title", "Delete Data");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      if (confirm("Yakin? akan menghapus data buku!") === true) {
        removeTaskFromCompleted(bookObject.id);
      } else {
        return false;
      }
    });

    div.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.setAttribute("title", "Mark is Read");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.setAttribute("title", "Delete Data");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      if (confirm("Yakin? akan menghapus data buku!") === true) {
        removeTaskFromCompleted(bookObject.id);
      } else {
        return false;
      }
    });

    const editButton = document.createElement("button");
    editButton.setAttribute("title", "Edit Data");
    editButton.classList.add("edit-button");

    const formInput = document.getElementById("formBook");
    const titleForm = document.querySelector("h2.title-form");
    const sectionForm = document.querySelector(".form");

    editButton.addEventListener("click", function () {
      formInput.classList.add("d-none");
      titleForm.textContent = "Form Edit Data";

      const info = document.createElement("p");
      info.innerText = "Sorry this Feature Comming Soon!";
      info.classList.add("info-warning");
      sectionForm.insertBefore(info, formInput);
    });

    div.append(checkButton, trashButton, editButton);
  }

  return div;
}

// Fungsi hapus data buku
function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  const deleteSucess = document.querySelector(".delete-success");

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Pesan ketika delete data
  if (removeTaskFromCompleted !== 0) {
    deleteSucess.classList.remove("d-none");
    const message = document.createElement("p");
    message.innerText = "Data buku berhasil dihapus!";
    deleteSucess.appendChild(message);
  } else {
    console.log("Data buku gagal dihapus");
  }

  saveData();
}

// Fungsi find berdasarkan Index buku
function findBookIndex(bookId) {
  for (const index in books.reverse()) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

// Fungsi undo data buku
function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk telah membaca
function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi cari buku berdasarkan ID
function findBook(bookId) {
  for (const bookItem of books.reverse()) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// Render dan tampilkan data buku ke list
document.addEventListener(RENDER_EVENT, function () {
  const listUnRead = document.getElementById("unread");
  listUnRead.innerHTML = "";

  const listRead = document.getElementById("read");
  listRead.innerHTML = "";

  for (const bookItem of books.reverse()) {
    const bookElement = makeBook(bookItem);
    // Kondisi jika belum dibaca, masukan ke list UnRead
    if (!bookItem.isCompleted) {
      listUnRead.append(bookElement);
    } else {
      listRead.append(bookElement);
    }
  }
});

// Fungsi simpan data ke Web Storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Cek browser mendukung Web Storage atau tidak
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// Event tampilkan data dari Web Storage jika ada
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data.reverse()) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi Pencarian data buku
const searchList = document.getElementById("search");
searchList.addEventListener("keyup", searchItem);

function searchItem(e) {
  const findList = e.target.value.toLowerCase();
  const itemList = document.querySelectorAll(".item-list");

  itemList.forEach((item) => {
    const isItem = item.firstChild.textContent.toLowerCase();

    if (isItem.indexOf(findList) != -1) {
      item.setAttribute("style", "display: block;");
    } else {
      item.setAttribute("style", "display: none !important;");
    }
  });
}

// Close Button Message
const boxMessage = document.getElementById("boxMessage");
const btnClose = document.getElementById("closeMessage");

btnClose.addEventListener("click", function () {
  boxMessage.classList.toggle("d-none");
});

// Close Button Delete
const boxMessageDelete = document.getElementById("boxMessageDelete");
const btnCloseDelete = document.getElementById("closeMessageDelete");

btnCloseDelete.addEventListener("click", function () {
  boxMessageDelete.classList.toggle("d-none");
});

// Modal PopUp
const modal = document.getElementById("modalPopUp");
modal.style.display = "none";

function closePopUp() {
  const modal = document.getElementById("modalPopUp");
  modal.style.display = "none";
}

function alertPopUp() {
  const modal = document.getElementById("modalPopUp");
  modal.style.display = "inline";
}
