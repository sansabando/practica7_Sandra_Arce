
const processKeywords = (keywords) => {
    return keywords.map(keyword => {
        return {
            id: keyword.id,
            name: keyword.name.replace(/[^a-zñáéíóú0-9 ]+/gi, "").trim().toLowerCase()
        };
    });
};

const addKeywordToList = (keyword, movieId, keywordId) => {
    const user = localStorage.getItem("selected_user");
    if (!user) {
        alert("No user selected.");
        return;
    }

    const keywordListKey = `keywords_${user}`;
    const currentList = JSON.parse(localStorage.getItem(keywordListKey)) || [];

    
    if (currentList.some(item => item.keywordId === keywordId)) {
        alert("Keyword already in your list.");
        return;
    }

    
    currentList.push({ name: keyword, movieId, keywordId });
    localStorage.setItem(keywordListKey, JSON.stringify(currentList));
    alert(`Keyword "${keyword}" added to your list.`);
};

    

const keywordsView = (movieId) => {
    const API_URL = `https://api.themoviedb.org/3/movie/${movieId}/keywords`;
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
        .then(data => {
            const processedKeywords = processKeywords(data.keywords);

            let view = `
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="back-button">Back</button>
                    <button class="home-button" style="background: none; border: none; color: #E50914; font-size: 1.5rem; cursor: pointer;">🏠 Home</button>
                </div>
                <h2>Keywords for Movie</h2>
                <ul>
                    ${processedKeywords.map(keyword => `
                        <li style="margin-bottom: 10px;">
                            <span>${keyword.name}</span>
                            <button class="add-keyword" 
                                data-keyword="${keyword.name}" 
                                data-movie-id="${movieId}" 
                                data-keyword-id="${keyword.id}">
                                Add to my list
                            </button>
                            <button class="search-movies-by-keyword" data-keyword-id="${keyword.id}">Search Movies</button>
                        </li>
                    `).join('')}
                </ul>
            `;

            document.getElementById('main').innerHTML = view;

            document.querySelectorAll('.add-keyword').forEach(button => {
                button.addEventListener('click', () => {
                    const keyword = button.dataset.keyword;
                    const movieId = button.dataset.movieId;
                    const keywordId = button.dataset.keywordId;
                    addKeywordToList(keyword, movieId, keywordId);
                });
            });

            document.querySelectorAll('.search-movies-by-keyword').forEach(button => {
                button.addEventListener('click', () => {
                    const keywordId = button.dataset.keywordId;
                    if (!keywordId) {
                        alert("Keyword ID is missing for this entry.");
                        console.error("Keyword ID not found for button:", button);
                        return;
                    }
                    searchMoviesByKeyword(keywordId); 
                });
            });
        })
        .catch(err => console.error(err));
};





const myKeywordsView = () => {
    const user = localStorage.getItem("selected_user");
    const keywordListKey = `keywords_${user}`;
    const currentList = JSON.parse(localStorage.getItem(keywordListKey)) || [];

    let view = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="back-button">Back</button>
            <button class="home-button" style="background: none; border: none; color: #E50914; font-size: 1.5rem; cursor: pointer;">🏠 Home</button>
        </div>
        <h2>My Keywords</h2>
        <ul>
            ${currentList.length === 0 
            ? '<p>No keywords added yet.</p>'
            : currentList.map((keyword, index) => `
                <li style="margin-bottom: 10px;">
                    <span>${keyword.name} (Keyword ID: ${keyword.keywordId || "N/A"})</span>
                    <button class="remove-keyword" data-index="${index}">Remove</button>
                    ${
                        keyword.keywordId 
                            ? `<button class="search-movies-by-keyword" data-keyword-id="${keyword.keywordId}">Search Movies</button>`
                            : '<span style="color: gray;">No Search Available</span>'
                    }
                </li>
            `).join('')}
        </ul>

    `;

    document.getElementById('main').innerHTML = view;

    
    document.querySelectorAll('.remove-keyword').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            removeKeywordFromList(index);
        });
    });

    
    document.querySelectorAll('.search-movies-by-keyword').forEach(button => {
        button.addEventListener('click', () => {
            const keywordId = button.dataset.keywordId;
            if (!keywordId) {
                alert("Keyword ID is missing for this entry.");
                console.error("Keyword ID not found for button:", button);
                return;
            }
            searchMoviesByKeyword(keywordId); 
        });
    });
};



const removeKeywordFromList = (index) => {
    const user = localStorage.getItem("selected_user");
    const keywordListKey = `keywords_${user}`;
    const currentList = JSON.parse(localStorage.getItem(keywordListKey)) || [];

    currentList.splice(index, 1);
    localStorage.setItem(keywordListKey, JSON.stringify(currentList));
    myKeywordsView();
};

