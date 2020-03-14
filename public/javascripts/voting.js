const queryString = window.location.search;

onload = function() {
  function vote(preference) {
    window.location.replace("/prefer"+ queryString + "&preference=" + preference);
  }
}
