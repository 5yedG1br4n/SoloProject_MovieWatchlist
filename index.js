const searchMovieInput = document.getElementById("search-movie-input");
const searchMovieBtn = document.getElementById("search-movie-btn");
const bodyEl = document.getElementById("mw-body");
const watchlistBody = document.querySelector(".watchlist-body");
const watchlistLink = document.getElementById("watchlist-link");

const moviesFromLocalStorage = JSON.parse(localStorage.getItem("myWatchlist"));
let movieDatabase = [];
let myWatchlist = [];

document.addEventListener("click", function (e) {
  if (e.target.dataset.add) {
    addMovieToWatchlist(e.target.dataset.add);
  } else if (e.target.id == "search-movie-btn") {
    renderHome();
  } else if (e.target.id == "watchlist-link") {
    addMovieToWatchlist(e.target.id);
  } else if (e.target.dataset.remove) {
    removeMovieFromWatchlist(e.target.dataset.remove);
  }
});

if (moviesFromLocalStorage) {
  myWatchlist = moviesFromLocalStorage;
  renderWatchlist();
  console.log(myWatchlist);
}

function addMovieToWatchlist(addBtnId) {
  // Check if the movie with the given IMDb ID is already in the watchlist
  const isMovieInWatchlist = myWatchlist.some(
    (movie) => movie.imdbID === addBtnId
  );

  // If the movie is not in the watchlist, add it
  if (!isMovieInWatchlist) {
    const selectedMovie = movieDatabase.find(
      (movie) => movie.imdbID === addBtnId
    );
    if (selectedMovie) {
      myWatchlist.push(selectedMovie);
      console.log("Movie added to watchlist:", selectedMovie);
    } else {
      console.log("Error: Movie not found in the database");
    }
  } else {
    console.log("Movie already exists in the watchlist!");
  }
  console.log(myWatchlist);
  localStorage.setItem("myWatchlist", JSON.stringify(myWatchlist));
}

function removeMovieFromWatchlist(removeBtnId) {
  const movieIndex = myWatchlist.findIndex(function (movie) {
    return movie.imdbID == removeBtnId;
  });

  myWatchlist.forEach(function (movie) {
    if (movie.imdbID == removeBtnId) {
      myWatchlist.splice(movieIndex, 1);
    }
  });
  localStorage.setItem("myWatchlist", JSON.stringify(myWatchlist));
  renderWatchlist();
}

function renderHome() {
  if (searchMovieInput.value) {
    getMovie();
  } else {
    bodyEl.innerHTML = `<p id="empty-state-para">Unable to find what you're looking for. Please try another search</p>`;
  }
}

function renderWatchlist() {
  watchlistBody.innerHTML = `
  <div id="movie-data-wrapper">${renderMoviesInfo(myWatchlist, true)}</div>
  `;
}

async function getMovie() {
  const movieIds = await fetch(
    `http://www.omdbapi.com/?apikey=fb24f65a&s=${searchMovieInput.value}`
  );
  const movieListData = await movieIds.json();
  const imdbIds = movieListData.Search.map((movie) => movie.imdbID);
  movieDatabase = await Promise.all(
    imdbIds.map(async (imdbId) => {
      const movie = await fetch(
        `http://www.omdbapi.com/?apikey=fb24f65a&i=${imdbId}`
      );
      return await movie.json();
    })
  );
  console.log(movieDatabase);
  bodyEl.innerHTML = `
    <div id="movie-data-wrapper">${renderMoviesInfo(movieDatabase, false)}</div>
  `;
}

function renderMoviesInfo(moviesDataArr, isWatchlist) {
  let moviesDataHtml = "";
  moviesDataArr.forEach(function (movie) {
    const { Poster, Title, Ratings, Runtime, Genre, Plot, Type, imdbID } =
      movie;

    const addButtonHtml = `
      <img class="addto-watchlist-btn" src="assets/add-btn-icon.svg" alt="A white add button" data-add="${imdbID}">
      <p class="watchlist-label">Watchlist</p>
    `;

    const removeButtonHtml = `
      <img class="remove-from-watchlist-btn" src="assets/remove-btn-icon.svg" alt="A white remove button" data-remove="${imdbID}">
      <p class="watchlist-label">Remove</p>
    `;

    const buttonHtml = isWatchlist ? removeButtonHtml : addButtonHtml;

    moviesDataHtml += `
      <div class="movie-data-container">
        <img class="movie-poster" src="${Poster}" alt="Movie poster for the ${Type} ${Title}">
        <div class="movie-inner-container">
          <div class="movie-header-container">
            <h3 class="movie-title">${Title}</h3>
            <img class="star-icon" src="assets/star-icon.svg" alt="A yellow star that represents rating">
            <p class="movie-rating">${
              Ratings && Ratings.length > 0 ? Ratings[0].Value : "N/A"
            }</p>  
          </div>
          <div class="movie-subheader-container">
            <p class="movie-runtime">${Runtime}</p>
            <p class="movie-genre">${Genre}</p>
            <div class="watchlist-btn-label">
            ${buttonHtml}
            </div>
          </div>
          <p class="movie-plot">${Plot}</p>
        </div>
      </div>
    `;
  });
  return moviesDataHtml;
}
