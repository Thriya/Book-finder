const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");

const modal = document.getElementById("bookModal");
const closeModal = document.getElementById("closeModal");

const modalCover = document.getElementById("modalCover");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalDesc = document.getElementById("modalDesc");

const feedbackBtn = document.getElementById("feedbackBtn");
const buyBtn = document.getElementById("buyBtn");
const shareBtn = document.getElementById("shareBtn");
const reviewsBtn = document.getElementById("reviewsBtn");

const feedbackForm = document.getElementById("feedbackForm");
const buyLinks = document.getElementById("buyLinks");
const linksList = document.getElementById("linksList");
const lowestPrice = document.getElementById("lowestPrice");
const reviewsSection = document.getElementById("reviewsSection");
const reviewsList = document.getElementById("reviewsList");

let currentBookId = null;

// Fake price data
const fakePrices = [
  { site: "Amazon", price: 350, url: "https://amazon.in" },
  { site: "Flipkart", price: 299, url: "https://flipkart.com" },
  { site: "Open Library", price: 0, url: "https://openlibrary.org" }
];

// Fetch books
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  const data = await res.json();
  displayBooks(data.items || []);
});

function displayBooks(books) {
  bookList.innerHTML = "";
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/100x150'}" alt="cover">
      <h3>${info.title}</h3>
      <p>${info.authors ? info.authors.join(", ") : "Unknown"}</p>
    `;
    card.addEventListener("click", () => openModal(info));
    bookList.appendChild(card);
  });
}

// Open Modal
function openModal(info) {
  modal.style.display = "block";
  modalCover.src = info.imageLinks?.thumbnail || "";
  modalTitle.textContent = info.title;
  modalAuthor.textContent = info.authors ? "By " + info.authors.join(", ") : "Unknown Author";
  modalDesc.textContent = info.description || "No description available";

  feedbackForm.classList.add("hidden");
  buyLinks.classList.add("hidden");
  reviewsSection.classList.add("hidden");

  currentBookId = info.industryIdentifiers?.[0]?.identifier || info.title;
}

// Close modal
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target == modal) modal.style.display = "none"; });

// Feedback
feedbackBtn.addEventListener("click", () => {
  feedbackForm.classList.toggle("hidden");
});
document.getElementById("submitFeedback").addEventListener("click", () => {
  const fbData = {
    name: document.getElementById("fbName").value,
    email: document.getElementById("fbEmail").value,
    message: document.getElementById("fbMessage").value
  };
  localStorage.setItem("feedback_" + Date.now(), JSON.stringify(fbData));
  alert("Feedback submitted!");
  feedbackForm.classList.add("hidden");
});

// Buy links
buyBtn.addEventListener("click", () => {
  buyLinks.classList.toggle("hidden");
  linksList.innerHTML = "";
  let lowest = Infinity, lowestSite = "";
  fakePrices.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${p.url}" target="_blank">${p.site}</a> - ${p.price === 0 ? "Free" : "₹" + p.price}`;
    linksList.appendChild(li);
    if (p.price < lowest && p.price !== 0) {
      lowest = p.price;
      lowestSite = p.site;
    }
  });
  lowestPrice.textContent = lowest === Infinity ? "Free available on Open Library" : `Lowest Price: ₹${lowest} at ${lowestSite}`;
});

// Share
shareBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href);
  alert("Book link copied to clipboard!");
});

// Reviews
reviewsBtn.addEventListener("click", () => {
  reviewsSection.classList.toggle("hidden");
  loadReviews();
});

document.getElementById("submitReview").addEventListener("click", () => {
  const rating = document.getElementById("rating").value;
  const text = document.getElementById("reviewText").value.trim();

  if (!text) {
    alert("Please write something!");
    return;
  }

  const review = { rating, text, date: new Date().toLocaleString() };
  let reviews = JSON.parse(localStorage.getItem("reviews_" + currentBookId)) || [];
  reviews.push(review);
  localStorage.setItem("reviews_" + currentBookId, JSON.stringify(reviews));

  document.getElementById("reviewText").value = "";
  loadReviews();
});

function loadReviews() {
  reviewsList.innerHTML = "";
  let reviews = JSON.parse(localStorage.getItem("reviews_" + currentBookId)) || [];
  if (reviews.length === 0) {
    reviewsList.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "review-item";
    div.innerHTML = `<strong>${"⭐".repeat(r.rating)}</strong><br>${r.text}<br><small>${r.date}</small>`;
    reviewsList.appendChild(div);
  });
}
