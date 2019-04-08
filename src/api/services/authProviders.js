/* eslint-disable camelcase */
const axios = require('axios');
const { github } = require('../../config/vars');
const { isNil, find } = require('lodash');

const githubAccessToken = async (code) => {
  const url = 'https://github.com/login/oauth/access_token';
  const { client_id, client_secret } = github;
  const data = {
    client_id,
    client_secret,
    code,
  };
  const response = await axios.post(
    url,
    data,
    { headers: { accept: 'application/json' } },
  );
  return response.data;
};

const githubUserEmail = async (access_token) => {
  const url = 'https://api.github.com/user/emails';
  const params = { access_token };
  const response = await axios.get(url, { params });
  return response.data;
};

exports.facebook = async (access_token) => {
  const fields = 'id, name, email, picture';
  const url = 'https://graph.facebook.com/me';
  const params = { access_token, fields };
  const response = await axios.get(url, { params });
  const {
    id, name, email, picture,
  } = response.data;
  return {
    service: 'facebook',
    picture: picture.data.url,
    id,
    name,
    email,
  };
};

exports.google = async (access_token) => {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const params = { access_token };
  const response = await axios.get(url, { params });
  const {
    sub, name, email, picture,
  } = response.data;
  return {
    service: 'google',
    picture,
    id: sub,
    name,
    email,
  };
};

exports.github = async (code) => {
  const { access_token } = await githubAccessToken(code);
  const url = 'https://api.github.com/user';
  const params = { access_token };
  const response = await axios.get(url, { params });
  const user = response.data;
  if (isNil(user.email)) {
    const emails = await githubUserEmail(access_token);
    const { email } = find(emails, { primary: true });
    user.email = email;
  }
  return {
    service: 'github',
    picture: user.avatar_url,
    id: user.id,
    name: user.login,
    email: user.email,
  };
};
