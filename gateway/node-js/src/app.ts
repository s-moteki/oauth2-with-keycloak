import http, {IncomingMessage, ServerResponse} from 'http'
import httpProxy from 'http-proxy'
import axios from 'axios'

// プロキシサーバ
const proxy = httpProxy.createProxyServer();
http.createServer(async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  if (req.url && req.url.startsWith('/private')) {
    // トークン検証
    const isValid = await validateToken(req.headers.authorization);
    if (!isValid) {
      res.statusCode = 401;
      res.write(JSON.stringify({message : 'unauthorized'}));
      res.end();
      return ;
    }
  }

  proxy.web(req, res, {target:'http://api:3000'});
}).listen(8000);

/**
 * authorizationヘッダーが有効なトークンか検証する
 *
 * @param token authorizationヘッダー
 * @returns 妥当性
 */
const  validateToken = async (token: string | undefined): Promise<boolean> => {
  if (token == undefined || !token.startsWith('Bearer ')) {
    return false;
  }

  let params = new URLSearchParams();
  params.append("token",token.substring(7));
  params.append("token_hint","access_token");
  params.append("client_id","test_gateway");
  params.append("client_secret","m1gr0uufRZIje2JItk6cEsFRGIkyGMKS");

  try{
    // keycloakへトークン検証リクエスト
    const res = await axios.post("http://keycloak:8080/auth/realms/test_service/protocol/openid-connect/token/introspect",params,{headers:{Host:'localhost:18080'}});
    if (res.status == 200 && res.data.active == true) {
      return true;
    }
  }catch(e) {
    if (axios.isAxiosError(e) && e.response) {
      console.log(e.message);
    }
    return false;
  }

  return false;
}
