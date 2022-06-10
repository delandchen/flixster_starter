// Global Variables
let page = 1;
let idArr = [];
const API_KEY = "d498a38ba2917a38b298752c083858d6";
const POPULAR_MOVIES_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`;
const SEARCH_MOVIES_API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`
const POSTER_SIZE = 'w300';
const POSTER_PATH = `https://image.tmdb.org/t/p/${POSTER_SIZE}`


// Query Selectors
const mainElement = document.querySelector(".main");
const movieDisplayElement = document.querySelector(".movies-grid");
const submitFormElement = document.querySelector(".submit-form");
const searchInputElement = document.querySelector("#search-input");
const showMoreButtonElement = document.querySelector(".load-more-movies-btn");
const clearButtonElement = document.querySelector("#x-button");
let modalBackdropElement = document.querySelector(".modal-backdrop");

const fetchSearchTerm = () => {
    return searchInputElement.value;
}

const handleSubmit = (e) => {
    // Fetch search term
    let searchTerm = fetchSearchTerm();
    console.log("search term is: " + searchTerm);

    // Prevent page from reloading after submit
    e.preventDefault()

    // If this is a fresh search or reload, we need to empty the display and reset page to 1
    if (movieDisplayElement) { movieDisplayElement.innerHTML = ''; }
    page = 1;

    // If there is no search term, then display popular.
    if (searchTerm.length == 0) {
        fetchLatestMovies();
    }
    // If there is a search term, fetch the searched movies
    else {
        fetchSearchedMovies(searchTerm);
    }
}


const handleClear = (e) => {
    e.preventDefault();
    page = 1;
    searchInputElement.value = "";
    console.log("element cleared");
    movieDisplayElement.innerHTML = "";
    fetchLatestMovies();
}


const fetchLatestMovies = async () => {
    const API_PATH = POPULAR_MOVIES_API_URL + `&page=${page}`;

    // Makes a request to API for recent movies
    console.log(`Making API request to: ${API_PATH}`);
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    });


    // Sends the json converted array of movie objects to be displayed
    console.log("response is: " + response.results);
    idArr = [];
    displayMovies(response.results);

    // Hide the clear button if there is no search term
    clearButtonElement.classList.add("hidden");
}


const fetchSearchedMovies = async (searchTerm) => {
    const API_PATH = SEARCH_MOVIES_API_URL + searchTerm + `&page=${page}`;

    // Makes a request to API for recent movies
    console.log(`Making API request to: ${API_PATH}`);
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    });

    // Sends the json converted array of movie objects to be displayed
    console.log("response is: " + response.results);
    idArr = [];
    displayMovies(response.results);

    // Reveal the clear button if there is a search term
    clearButtonElement.classList.remove("hidden");
}


const fetchAdditionalMovies = async (e) => {
    e.preventDefault();
    page += 1;
    let searchTerm = fetchSearchTerm();
    const API_PATH = (searchTerm.length > 0) ? SEARCH_MOVIES_API_URL + searchTerm + `&page=${page}`
        : POPULAR_MOVIES_API_URL + `&page=${page}`;

    // Makes a request to API
    console.log(`Making API request to: ${API_PATH}`);
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    });

    displayMovies(response.results);
}


const fetchTrailerEmbedUrl = async (id) => {
    const API_PATH = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`;
    console.log("api path is: " + API_PATH);

    // Fetch the youtube ID
    console.log("Fetching youtube ID");
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    })
    const youtubeId = response.results[0].key;

    // Return the Youtube embed link
    return `https://www.youtube.com/embed/${youtubeId}`;
}

const displayMovies = (arr) => {
    arr.forEach((obj) => {
        const movieId = obj.id;
        const moviePosterPath = obj.poster_path;
        const title = obj.title;
        const votes = obj.vote_average;
        movieDisplayElement.innerHTML +=
            `<div class="movie-card" id="${movieId}"> 
        <h2 class="movie-title" id="${movieId}"> ${title} </h2>
        <img class="movie-poster" src=${POSTER_PATH + moviePosterPath} alt="${title}"> 
        <h2 class="movie-votes"> Rating: ${votes} / 10 </h2>
        </div>
        `;
        idArr.push(movieId);
    });

    // Show the 'load-more-movies-btn' button
    showMoreButtonElement.classList.remove("hidden");

    // Add Event listener for the Movie Cards
    for (let i = 0; i < idArr.length; i++) {
        document.getElementById(idArr[i]).addEventListener("click", displayModal);
    }
}


const displayModal = async (e) => {
    console.log("movie card has been clicked");
    const movieId = e.currentTarget.id;
    console.log("target id is: " + movieId);
    const youtubeUrl = await fetchTrailerEmbedUrl(movieId);
    console.log("youtube link is: " + youtubeUrl);

    // modalBackdropElement = document.querySelector(".modal-backdrop");

    modalBackdropElement.classList.remove("hidden")

    mainElement.innerHTML += `
    <div class="modal">
    <iframe width="560" height="315"
    src="${youtubeUrl}" frameborder="0" 
    allowfullscreen></iframe>
    </div>
    `;

    modalBackdropElement.addEventListener("click", function (e) {
        e.preventDefault();
        modalBackdropElement.classList.add("hidden");
        document.querySelector(".modal").remove();
        console.log("test");

        for (let i = 0; i < idArr.length; i++) {
            document.getElementById(idArr[i]).addEventListener("click", displayModal);
        }
    });


}


// Event Listener
submitFormElement.addEventListener("submit", handleSubmit);
showMoreButtonElement.addEventListener("click", fetchAdditionalMovies);
clearButtonElement.addEventListener("click", handleClear);

// Windows Onload
window.onload = fetchLatestMovies;
