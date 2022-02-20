function introspect(r) {
  r.subrequest("/_introspect_access_token_request",
    function(res) {
      if (res.status == 200) {
        var response = JSON.parse(res.responseBody);
        if (response.active == true) {
          r.return(204);
        } else {
          r.return(401);
        }
      } else {
        r.return(401);
      }
    }
  );
}