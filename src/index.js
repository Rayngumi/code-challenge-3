document.addEventListener('DOMContentLoaded', () => {
    fetchMovieDetails(1);
    fetchAllMovies();
    
    document.body.addEventListener('click', event => {
        if (event.target.id === 'buy-ticket') {
            handleBuyTicket();
        }
    });

    document.getElementById('films').addEventListener('click', event => {
        if (event.target.classList.contains('film')) {
            const filmId = event.target.dataset.id;
            fetchMovieDetails(filmId);
        } else if (event.target.classList.contains('delete')) {
            const filmId = event.target.dataset.id;
            deleteFilm(filmId);
        }
    });
});

function handleBuyTicket() {
    const movieId = 1;
    const ticketsRemaining = parseInt(document.getElementById('ticket-num').textContent);
    
    if (ticketsRemaining > 0) {
        const newTicketsSold = ticketsRemaining - 1;
        updateTicketsSold(movieId, newTicketsSold);
    } else {
        console.log('No tickets available.');
    }
}

function fetchMovieDetails(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            const titleElement = document.getElementById('title');
            const runtimeElement = document.getElementById('runtime');
            const showtimeElement = document.getElementById('showtime');
            const descriptionElement = document.getElementById('film-info');
            const ticketNumElement = document.getElementById('ticket-num');
            const posterElement = document.getElementById('poster');

            titleElement.textContent = movie.title;
            runtimeElement.textContent = `${movie.runtime} minutes`;
            showtimeElement.textContent = movie.showtime;
            descriptionElement.textContent = movie.description;
            ticketNumElement.textContent = movie.capacity - movie.tickets_sold;
            posterElement.src = movie.poster;
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

function fetchAllMovies() {
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(movies => {
            const filmsList = document.getElementById('films');
            filmsList.innerHTML = '';

            movies.forEach(movie => {
                const filmItem = document.createElement('li');
                filmItem.classList.add('film', 'item');
                filmItem.textContent = movie.title;
                filmItem.dataset.id = movie.id;
                filmsList.appendChild(filmItem);
            });
        })
        .catch(error => console.error('Error fetching movies:', error));
}

function updateTicketsSold(movieId, newTicketsSold) {
    fetch(`http://localhost:3000/films/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            const updatedTicketsSold = movie.tickets_sold + newTicketsSold;
            if (updatedTicketsSold <= movie.capacity) {
                fetch(`http://localhost:3000/films/${movieId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tickets_sold: updatedTicketsSold
                    })
                })
                .then(response => response.json())
                .then(updatedMovie => {
                    const ticketNumElement = document.getElementById('ticket-num');
                    ticketNumElement.textContent = updatedMovie.capacity - updatedMovie.tickets_sold;

                    if (updatedMovie.tickets_sold === updatedMovie.capacity) {
                        document.getElementById('buy-ticket').textContent = 'Sold Out';
                        document.getElementById('films').querySelector(`li[data-id="${movieId}"]`).classList.add('sold-out');
                    }

                    const numberOfTickets = 1;
                    postTicket(movieId, numberOfTickets);
                })
                .catch(error => console.error('Error updating tickets sold:', error));
            } else {
                console.log('Not enough tickets available.');
            }
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

function postTicket(movieId, numberOfTickets) {
    fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            film_id: movieId,
            number_of_tickets: numberOfTickets
        })
    })
    .then(response => response.json())
    .then(newTicket => console.log('New ticket added:', newTicket))
    .catch(error => console.error('Error adding new ticket:', error));
}

function deleteFilm(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            const filmItem = document.querySelector(`li[data-id="${filmId}"]`);
            filmItem.remove();
        } else {
            console.error('Failed to delete film.');
        }
    })
    .catch(error => console.error('Error deleting film:', error));
}
