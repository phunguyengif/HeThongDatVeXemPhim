import { RouterProvider } from 'react-router-dom'; 

import { appRouter } from './routes/appRoutes.jsx';
import { Provider } from 'react-redux';


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css'
import './assets/css/header.css'
import './assets/css/login.css'
import './assets/css/menubar.css'

import './assets/scss/footer.scss'
import './assets/scss/datve.scss'
import './assets/scss/moviecard.scss'
import './assets/scss/movieslider.scss'
import './assets/scss/moviedetail.scss'
import './assets/scss/quanliphim.scss'
import './assets/scss/roommanagement.scss'
import './assets/scss/cinemamanagement.scss'
import './assets/scss/snackmanagement.scss'
import './assets/scss/showtimemanagement.scss'
import './assets/scss/bookingpage.scss'
import './assets/scss/checkoutpage.scss'
import './assets/scss/cinemapage.scss'
import './assets/scss/searchpage.scss'



function App() {
  return (
    <RouterProvider router={appRouter} />
  )
}
export default App
