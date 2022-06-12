// Global Variables
let page = 1;
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
const clearButtonElement = document.querySelector("#close-search-btn");
const modalBackdropElement = document.querySelector(".modal-backdrop");
const modalContentElement = document.querySelector(".modal-content");


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

    // Reset page number and clear search bar + movie display
    page = 1;
    searchInputElement.value = "";
    movieDisplayElement.innerHTML = "";
    console.log("Search input and movie display cleared");

    // Populate with latest movies
    fetchLatestMovies();
}


/////////////////////   API functions  /////////////////////

const fetchLatestMovies = async () => {
    const API_PATH = POPULAR_MOVIES_API_URL + `&page=${page}`;

    // Makes a request to API for recent movies
    console.log(`Making API request to: ${API_PATH}`);
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    });


    // Sends the json converted array of movie objects to be displayed
    console.log("response is: " + response.results);
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
    displayMovies(response.results);

    // Reveal the clear button if there is a search term
    clearButtonElement.classList.remove("hidden");
}

const fetchAdditionalMovies = async (e) => {
    e.preventDefault();

    // Increment the page number for the API query
    page += 1;
    let searchTerm = fetchSearchTerm();

    // Determine if we need to add additional movies for popular or for a search term
    const API_PATH = (searchTerm.length > 0) ? SEARCH_MOVIES_API_URL + searchTerm + `&page=${page}`
        : POPULAR_MOVIES_API_URL + `&page=${page}`;

    // Makes a request to API
    console.log(`Making API request to: ${API_PATH}`);
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    });

    // Render them
    displayMovies(response.results);
}

const fetchTrailerEmbedUrl = async (id) => {
    // Path to get the youtube ID needed for the embed link
    const API_PATH = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`;

    // Fetch the youtube ID
    console.log("Fetching Youtube ID");
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    })
    const youtubeId = response.results[0].key;

    // Return the Youtube embed link
    return `https://www.youtube.com/embed/${youtubeId}`;
}

const fetchMovieDetails = async (id) => {
    const API_PATH = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`;
    console.log("api link is: " + API_PATH);

    console.log("Fetching Movie Details");
    const response = await fetch(API_PATH).then(async (res) => {
        return await res.json();
    })

    return response;
}


//////////////////////////////////////////////////////////////


/////////////////////  Display Functions /////////////////////
const displayMovies = (arr) => {
    arr.forEach((obj) => {
        createMovieCard(obj);
    });

    // Apply event listener to every element with the class "movie-card"
    document.querySelectorAll(".movie-card").forEach(
        index => index.addEventListener("click",
            displayModal
        ));


    // Show the 'load-more-movies-btn' button
    showMoreButtonElement.classList.remove("hidden");
}

const createMovieCard = (obj) => {
    // Grab movie object details
    let movieId = obj.id;
    let moviePosterPath = obj.poster_path;
    let title = obj.title;
    let votes = obj.vote_average;

    // Add movie card to display div
    movieDisplayElement.innerHTML +=
        `<div class="movie-card" id="${movieId}"> 
        <img class="movie-poster" src=${POSTER_PATH + moviePosterPath} alt="${title}"> 
        <h2 class="movie-title" id="${movieId}"> ${title} </h2>
        <h2 class="movie-votes"> ${votes} / 10 </h2>
        </div>
        `;
}


const displayModal = async (e) => {
    const movieId = e.currentTarget.id;

    // Fetch the youtube embed link for the movie
    const youtubeUrl = await fetchTrailerEmbedUrl(movieId);
    console.log("Youtube embed link is: " + youtubeUrl);

    // Fetch details for the specific movie
    const movieObj = await fetchMovieDetails(movieId);
    const title = movieObj.original_title;
    const details = movieObj.overview;

    // Set modal content
    modalContentElement.innerHTML = `
    <div class="modal">
    <h1 class="modal-title"> ${title} </h1> 
    <iframe class="modal-video" width="560" height="315"
    src="${youtubeUrl}" frameborder="0" 
    allowfullscreen></iframe>
    <p class="modal-details"> ${details} </p>
    </div>
    `;

    // Reveal modal by removing 'hidden' class in modal-backdorp
    modalBackdropElement.classList.remove("hidden")

}


const hideModal = (e) => {
    e.preventDefault();
    modalBackdropElement.classList.add("hidden");
}
//////////////////////////////////////////////////////////////


// Event Listener
submitFormElement.addEventListener("submit", handleSubmit);
showMoreButtonElement.addEventListener("click", fetchAdditionalMovies);
clearButtonElement.addEventListener("click", handleClear);
modalBackdropElement.addEventListener("click", hideModal);

// Windows Onload
window.onload = fetchLatestMovies;
