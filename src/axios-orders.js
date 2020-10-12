import axios from "axios";

const instance = axios.create({
  baseURL: "https://react-burger-becec.firebaseio.com/",
});

export default instance;
