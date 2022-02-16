function introspect(r) {
    r.subrequest("/_introspect_access_token_request",
        function(reply) {
            if (reply.status == 200) {
                var response = JSON.parse(reply.responseBody);
                if (response.active == true) {
                    r.return(204);
                } else {
                    r.return(403);
                }
            } else {
                r.return(401);
            }
        }
    );
}