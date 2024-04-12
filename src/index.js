function fetchMovies() {
  return fetch('http://localhost:3000/films')
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      console.error('Error fetching movies:', error);
      return [];
    });
}

function fetchMovieById(id) {
  return fetch(`http://localhost:3000/films/${id}`)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      console.error(`Error fetching movie with id ${id}:`, error);
      return null;
    });
}

function displayMovieDetails(movie) {
  const posterElement = document.getElementById('poster');
  const titleElement = document.getElementById('title');
  const runtimeElement = document.getElementById('runtime');
  const descriptionElement = document.getElementById('film-info');
  const showtimeElement = document.getElementById('showtime');
  const ticketNumElement = document.getElementById('ticket-num');
  const buyTicketButton = document.getElementById('buy-ticket');

  posterElement.src = movie.poster;
  titleElement.textContent = movie.title;
  runtimeElement.textContent = `${movie.runtime} minutes`;
  descriptionElement.textContent = movie.description;
  showtimeElement.textContent = movie.showtime;
  ticketNumElement.textContent = `${movie.capacity - movie.tickets_sold}`;

  if (movie.capacity - movie.tickets_sold <= 0) {
    buyTicketButton.textContent = 'Sold Out';
    buyTicketButton.disabled = true;
  } else {
    buyTicketButton.textContent = 'Buy Ticket';
    buyTicketButton.disabled = false;
  }
}

function populateMovieMenu(movieList) {
  const filmsList = document.getElementById('films');
  filmsList.innerHTML = '';
  movieList.forEach(function(movie) {
    const listItem = document.createElement('li');
    listItem.classList.add('film', 'item');
    listItem.textContent = movie.title;
    listItem.dataset.movieId = movie.id;
    listItem.addEventListener('click', function() {
      fetchMovieById(movie.id)
        .then(function(movieDetails) {
          displayMovieDetails(movieDetails);
        })
        .catch(function(error) {
          console.error('Error fetching movie details:', error);
        });
    });
    filmsList.appendChild(listItem);
  });
}

function buyTicket(movieId) {
  fetchMovieById(movieId)
    .then(function(movie) {
      if (movie.capacity - movie.tickets_sold <= 0) {
        console.log('Movie is sold out.');
        return;
      }
      const newTicketsSold = movie.tickets_sold + 1;
      return fetch(`http://localhost:3000/films/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: newTicketsSold }),
      });
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to update tickets sold.');
      }
      return response.json();
    })
    .then(function(updatedMovie) {
      displayMovieDetails(updatedMovie);
      console.log('Ticket bought successfully.');
    })
    .catch(function(error) {
      console.error('Error buying ticket:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  fetchMovies()
    .then(function(movies) {
      populateMovieMenu(movies);
      if (movies.length > 0) {
        fetchMovieById(movies[0].id).then(function(movieDetails) {
          displayMovieDetails(movieDetails);
        });
      }
    })
    .catch(function(error) {
      console.error('Error loading movies:', error);
    });

  document.getElementById('buy-ticket').addEventListener('click', function() {
    const selectedMovieListItem = document.querySelector('.film.item.selected');
    if (selectedMovieListItem) {
      const movieId = selectedMovieListItem.dataset.movieId;
      buyTicket(movieId);
    } else {
      console.error('No movie selected.');
    }
  });

  const movieListItems = document.querySelectorAll('.film.item');
  movieListItems.forEach(function(item) {
    item.addEventListener('click', function() {
      movieListItems.forEach(function(item) {
        item.classList.remove('selected');
      });
      item.classList.add('selected');
    });
  });
});
