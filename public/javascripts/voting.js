const queryString = window.location.search;

function vote(preference) {
  window.location.replace("/p"+ queryString + "&preference=" + preference);
}
