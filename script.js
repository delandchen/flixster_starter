// Global Variables
let page = 1;
const API_KEY = "d498a38ba2917a38b298752c083858d6";
const POPULAR_MOVIES_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`;
const SEARCH_MOVIES_API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`
const POSTER_SIZE = 'w300';
const POSTER_PATH = `https://image.tmdb.org/t/p/${POSTER_SIZE}`


// Query Selectors
const movieDisplayElement = document.querySelector(".movies-grid");
const submitFormElement = document.querySelector(".submit");
const searchInputElement = document.querySelector("#search-input");
const showMoreButtonElement = document.querySelector(".load-more-movies-btn");

const fetchSearchTerm = () => {
    return searchInputElement.value;
}

const handleSumbit = (e) => {
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
}


const fetchAdditionalMovies = async () => {
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


const displayMovies = (arr) => {
    arr.forEach((obj, index) => {
        const movieId = obj.id;
        const moviePosterPath = obj.poster_path;
        const title = obj.title;
        const votes = obj.vote_average;
        movieDisplayElement.innerHTML +=
            `<div class="movie-card"> 
        <h2 class="movie-title"> ${title} </h2>
        <img class="movie-poster" src=${POSTER_PATH + moviePosterPath} alt="${title}"> 
        <h2 class="movie-votes"> ${votes} </h2>
        </div>
        `;
    });

    // Show the 'load-more-movies-btn' button
    showMoreButtonElement.classList.remove("hidden");
}

// Event Listener
submitFormElement.addEventListener("submit", handleSumbit);
showMoreButtonElement.addEventListener("click", fetchAdditionalMovies);

// Windows Onload
window.onload = fetchLatestMovies;
