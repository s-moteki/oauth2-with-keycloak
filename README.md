# oauth2-with-keycloak

keycloak を用いた認可・認証機能(OAuth2.0、OpenID Connect)の提供

このリポジトリでは、APIゲートウェイを経由したエンドポイントへのアクセスを認可機能(keycloak自身で認証も行う)で保護するケースを想定

![フロー](https://github.com/s-moteki/oauth2-with-keycloak/blob/main/docs/flow.jpg?raw=true)

## 構成

| ミドルウェア・OSS | 用途              |
| ----------------- | ----------------- |
| keycloak          | 認証機能の提供         |
| mysql             | keycloak の永続化ストレージ |
| nginx             | API ゲートウェイ(1)  |
| node.js           | API ゲートウェイ(2)  |
| json-server       | モック API(保護対象)        |
| docker-compose       | コンテナ環境        |

認可サーバー、API Gateway、APIを構成(下記青線)
![構成図](https://github.com/s-moteki/oauth2-with-keycloak/blob/main/docs/infrastructure.jpg?raw=true)

## セットアップ

1. リポジトリのクローン

1. keycloak環境の構築

```bash
# リポジトリに移動
cd oauth2-with-keycloak

# apiゲートウェイをnodeで起動する場合
docker-compose up node-gateway
# apiゲートウェイをnginxで起動する場合
docker-compose up nginx-gateway

# api疎通確認
curl http://localhost:8080/public
```

##### Keycloakの起動確認  

ブラウザで下記URLから管理画面へアクセス  

> <http://localhost:18080/auth/admin/>

以下の画面が表示されていれば起動完了

![admin_front_image](https://github.com/s-moteki/oauth2-with-keycloak/blob/main/docs/keycloak_admin_front.png?raw=true)

## 初期提供機能

### **● 公開されたAPIへのアクセス**

```bash
curl http://localhost:8080/public
```

```json

 {
  "message" : "ok",
  "access_type":"public"
 }

```

下記へのリクエストは認証情報必須

```bash
curl http://localhost:8080/private
```

未認証時レスポンス

```json

 {
    "message": "unauthorized"
 }

```

### **● 管理画面へのアクセス**

下記情報を使用しブラウザからアクセス  
username : admin  
password : admin  

url : http://localhost:18080/auth

### **● Auth2.0標準フローによる保護されたAPIへのアクセス**

#### 1. 下記URLからログイン画面へアクセスし、下記情報でログイン(または新規登録)

username : test-user
password : password

> http://localhost:18080/auth/realms/test_service/protocol/openid-connect/auth?client_id=test_client&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F&response_mode=query&response_type=code

#### 2. ログイン成功後、画面遷移しURLに下記の形式で認証コードが返される  

※実際にはwebサーバーにリダイレクトさせて認証コードを取り出す

> http://localhost:8080/?session_state=XXXX&code=認証コード

#### 3. 前のステップで取得した認証コードからアクセストークンを取得  

※①のステップで新規登録した場合はusername=登録したユーザー名になる

```bash

curl http://localhost:18080/auth/realms/test_service/protocol/openid-connect/token -d 'grant_type=authorization_code&username=test-user&client_id=test_client&client_secret=wgefmNBGop63ctr564st1mDtWuNfP1Uw&code=認証コード&redirect_uri=http://localhost:8080/'

```

レスポンス例

```json
{
  "access_token":"アクセストークン",
  "expires_in":300,
  "refresh_expires_in":1800,
  "refresh_token":"リフレッシュトークン",
  "token_type":"Bearer",
  "not-before-policy":1643635658,
  "session_state":"XXXXXXXXXXXXXXX",
  "scope":"email profile"
}
```

#### 4. アクセストークンを認証ヘッダーに設定し、保護されたエンドポイントへリクエスト

```bash

curl 'http://localhost:8080/private' \
--header 'Authorization: Bearer アクセストークン'

```

レスポンス

```json

 {
  "message" : "ok",
  "access_type":"private"
 }

```
