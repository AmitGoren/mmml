const queryString = window.location.search;

// const urlParams = new URLSearchParams(queryString);

function send(preference) {
  console.log("Hi!");
  window.location.replace("/prefer"+ queryString + "&prefer=" + preference);
}
