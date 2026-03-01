const axios = require("axios");

exports.discover = async (req, res) => {

 try {

  const response =
  await axios.get(
   "https://api.themoviedb.org/3/discover/movie",
   {
    headers:{
     Authorization:
`Bearer ${process.env.TMDB_API_KEY}`
    },
    params:{
     sort_by:"popularity.desc",
     include_adult:false,
     page:1
    }
   }
  );

  const movies =
  response.data.results.map(movie => ({

   id: movie.id,
   title: movie.title,

   poster:
`https://image.tmdb.org/t/p/w500${movie.poster_path}`,

   backdrop:
`https://image.tmdb.org/t/p/original${movie.backdrop_path}`,

   rating: movie.vote_average,

   release_date: movie.release_date

  }));

  res.json(movies);

 } catch(error){

  console.error(error.response?.data || error.message);

  res.status(500).json({
   error:"TMDB fetch failed"
  });

 }

};