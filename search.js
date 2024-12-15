
const toggleSearchBar = () => {
    const user = localStorage.getItem("selected_user"); 
    const profileHeader = document.querySelector('.profile-header');
    const existingSearchBar = document.querySelector('.search-bar');

    if (existingSearchBar) {
        existingSearchBar.remove(); 
        return;
    }

    const searchBar = document.createElement('div');
    searchBar.classList.add('search-bar');
    searchBar.innerHTML = `
        <form id="search-form" style="display: inline-block; margin-right: 10px;">
            <input type="text" id="search-input" placeholder="Search movies by title..." required>
            <button type="submit" class="search-btn" style="background-color: #E50914; color: #fff; border: none; padding: 5px 10px; cursor: pointer;">Search</button>
        </form>
        <button id="category-btn" style="background-color: #E50914; color: #fff; border: none; padding: 5px 10px; cursor: pointer;">Categories</button>
    `;

    profileHeader.after(searchBar);

    document.getElementById('search-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const query = document.getElementById('search-input').value.trim();

        if (!query) {
            alert('Please enter a valid search term.');
            return;
        }

        searchContr(query, null, user); 
    });

    document.getElementById('category-btn').addEventListener('click', fetchAndShowCategories);
};

const searchContr = (query, genreId, user) => {
    let API_URL = 'https://api.themoviedb.org/3/discover/movie'; 
    const API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MTY1ODVjMWNiYTVkYzQwZWZhYWM2NjhlYmNjOWUwNiIsIm5iZiI6MTczMTgzNzI4MC4yMDEwNDMsInN1YiI6IjY3MzRkMmJhMTJkNzI5MDEwYjkyNjNhYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uMO8MPxsET-zISfYVKTS7cxh_qSx6QEDIPUM5Z1zVfM';

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: API_TOKEN,
        },
    };

    // Si hay un término de búsqueda (query), usa el endpoint de búsqueda
    if (query) {
        API_URL = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`;
    } 
    // Si no, utiliza el filtro por género
    else if (genreId) {
        API_URL = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}`;
    } else {
        console.error("No search query or genre provided.");
        return;
    }

    fetch(API_URL, options)
        .then(response => response.json())
        .then(data => resultsView(data.results, user))
        .catch(err => console.error('Error:', err));
};



const resultsView = (results, user) => {
    const mainContainer = document.getElementById('main');
    mainContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="back-button">Back</button>
            <button class="home-button" style="background: none; border: none; color: #E50914; font-size: 1.5rem; cursor: pointer;">🏠 Home</button>
        </div>
        <h2>Search Results</h2>
        <div id="search-results">
            ${
                results.length === 0
                    ? '<p>No results found.</p>'
                    : results.map(result => `
                        <div class="movie">
                            <img src="https://image.tmdb.org/t/p/w200${result.poster_path}" alt="${result.title}" onerror="this.src='files/noimage.png'">
                            <div class="title">${result.title}</div>
                            <p>Release Date: ${result.release_date || 'Unknown'}</p>
                            <button class="add-from-api" data-id="${result.id}">Add</button>
                        </div>
                    `).join('')
            }
        </div>
    `;

    

    
    document.querySelectorAll('.add-from-api').forEach(btn => {
        btn.addEventListener('click', () => {
            const movieId = btn.getAttribute('data-id');
            const movie = results.find(r => r.id === parseInt(movieId));
            addFromAPIContr(movie, user);
        });
    });
};



const addFromAPIContr = (movie, user) => {
    const my_movies_key = `my_movies_${user}`;
    const my_movies = JSON.parse(localStorage.getItem(my_movies_key)) || [];

   
    if (my_movies.some(m => m.id === movie.id)) {
        alert('This movie already exists in your profile!');
        return;
    }

    
    my_movies.push({
        id: movie.id,
        title: movie.title,
        director: movie.director || 'Unknown', 
        thumbnail: movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : 'files/noimage.png',
    });

    localStorage.setItem(my_movies_key, JSON.stringify(my_movies));
    alert('Movie added successfully to your profile!');
};

const getTrendingMovies = () => {
    const API_URL = 'https://api.themoviedb.org/3/trending/movie/day'; 
    const API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MTY1ODVjMWNiYTVkYzQwZWZhYWM2NjhlYmNjOWUwNiIsIm5iZiI6MTczMTgzNzI4MC4yMDEwNDMsInN1YiI6IjY3MzRkMmJhMTJkNzI5MDEwYjkyNjNhYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uMO8MPxsET-zISfYVKTS7cxh_qSx6QEDIPUM5Z1zVfM';

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: API_TOKEN,
        },
    };

    return fetch(API_URL, options)
        .then(response => response.json())
        .then(data => data.results) 
        .catch(err => {
            console.error('Error fetching trending movies:', err);
            return [];
        });
};

const trendingView = (trendingMovies) => {
    if (!trendingMovies || trendingMovies.length === 0) {
        return '<p>No trending movies available at the moment.</p>';
    }

    return `
        <h2 class="profile-subheader">Trending Movies</h2>
        <div class="trending-movies">
            ${trendingMovies.map((movie, index) => `
                <div class="movie">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" onerror="this.src='files/noimage.png'">
                    <div class="title">${movie.title}</div>
                    <p>Release Date: ${movie.release_date || 'Unknown'}</p>
                    <button class="add-trending" data-index="${index}" style="background-color: #E50914; color: #fff; border: none; padding: 5px 10px; cursor: pointer;">Add</button>
                </div>
            `).join('')}
        </div>
    `;
};

const searchMoviesByKeyword = (keywordId) => {
    const API_URL = `https://api.themoviedb.org/3/discover/movie`;
    const API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MTY1ODVjMWNiYTVkYzQwZWZhYWM2NjhlYmNjOWUwNiIsIm5iZiI6MTczMTgzNzI4MC4yMDEwNDMsInN1YiI6IjY3MzRkMmJhMTJkNzI5MDEwYjkyNjNhYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uMO8MPxsET-zISfYVKTS7cxh_qSx6QEDIPUM5Z1zVfM';

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: API_TOKEN,
        },
    };

    fetch(`${API_URL}?with_keywords=${keywordId}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch movies.');
            }
            return response.json();
        })
        .then(data => displaySearchResults(data.results)) 
        .catch(err => {
            console.error('Error fetching movies by keyword:', err);
            alert('Error fetching movies. Please try again later.');
        });
};




const displaySearchResults = (movies) => {
    if (!movies || movies.length === 0) {
        document.getElementById('main').innerHTML = `
            <div style="text-align: center; color: #bbb;">
                <p>No movies found for the selected keyword.</p>
            </div>
        `;
        return;
    }

    let view = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="back-button">Back</button>
            <button class="home-button" style="background: none; border: none; color: #E50914; font-size: 1.5rem; cursor: pointer;">🏠 Home</button>
        </div>
        <h2>Movies for Selected Keyword</h2>
        <div id="search-results">
            ${movies.map(movie => `
                <div class="movie">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" onerror="this.src='files/noimage.png'">
                    <div class="title">${movie.title}</div>
                    <p>Release Date: ${movie.release_date || 'Unknown'}</p>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('main').innerHTML = view;
};




const addTrendingContr = (movie, user) => {
    const my_movies_key = `my_movies_${user}`;
    const my_movies = JSON.parse(localStorage.getItem(my_movies_key)) || [];

    
    if (my_movies.some(m => m.id === movie.id)) {
        alert('This movie already exists in your favorites!');
        return;
    }

    
    const newMovie = {
        id: movie.id,
        title: movie.title,
        director: movie.director || 'Unknown', 
        thumbnail: movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : 'files/noimage.png',
    };

    my_movies.push(newMovie);
    localStorage.setItem(my_movies_key, JSON.stringify(my_movies));

    
    const favoritesList = document.querySelector('.movie-list');
    const newMovieElement = document.createElement('div');
    newMovieElement.classList.add('movie');
    newMovieElement.innerHTML = `
        <img src="${newMovie.thumbnail}" onerror="this.src='files/noimage.png'" alt="${newMovie.title}">
        <div class="title">${newMovie.title}</div>
        <div class="actions">
            <button class="show" data-my-id="${my_movies.length - 1}">Show</button>
            <button class="edit" data-my-id="${my_movies.length - 1}">Edit</button>
            <button class="delete" data-my-id="${my_movies.length - 1}">Delete</button>
        </div>
    `;
    favoritesList.appendChild(newMovieElement);

    
    newMovieElement.querySelector('.show').addEventListener('click', () => showContr(my_movies.length - 1));
    newMovieElement.querySelector('.edit').addEventListener('click', () => editContr(my_movies.length - 1));
    newMovieElement.querySelector('.delete').addEventListener('click', () => deleteContr(my_movies.length - 1));

   
    alert('Movie added successfully to your favorites!');
};

const fetchAndShowCategories = () => {
    const API_URL = 'https://api.themoviedb.org/3/genre/movie/list';
    const API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MTY1ODVjMWNiYTVkYzQwZWZhYWM2NjhlYmNjOWUwNiIsIm5iZiI6MTczMTgzNzI4MC4yMDEwNDMsInN1YiI6IjY3MzRkMmJhMTJkNzI5MDEwYjkyNjNhYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uMO8MPxsET-zISfYVKTS7cxh_qSx6QEDIPUM5Z1zVfM';

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: API_TOKEN,
        },
    };

    fetch(API_URL, options)
        .then(response => response.json())
        .then(data => showCategoriesModal(data.genres))
        .catch(err => console.error('Error fetching categories:', err));
};

const showCategoriesModal = (genres) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '1000';
    modal.style.backgroundColor = '#141414';
    modal.style.color = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    modal.style.maxWidth = '90%';
    modal.style.maxHeight = '80%';
    modal.style.overflowY = 'auto';

    modal.innerHTML = `
        <h2>Choose a Category</h2>
        <ul style="list-style: none; padding: 0;">
            ${genres.map(genre => `
                <li style="margin: 10px 0;">
                    <button class="category-select-btn" data-genre-id="${genre.id}" style="background-color: #E50914; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px;">${genre.name}</button>
                </li>
            `).join('')}
        </ul>
        <button id="close-modal-btn" style="background-color: #c40812; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin-top: 10px;">Close</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.querySelectorAll('.category-select-btn').forEach(button => {
        button.addEventListener('click', () => {
            const genreId = button.dataset.genreId;
            document.body.removeChild(modal);
            searchContr(null, genreId, localStorage.getItem("selected_user")); // Llama a la función de búsqueda con el ID del género
        });
    });
};
