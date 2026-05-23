import OpenAI from './node4.js';

const client = new OpenAI({
  apiKey: '***…mtYV0I',
  baseURL: 'https://ai.api.cloud.yandex.net/v1',
  defaultHeaders: {
    'OpenAI-Project': 'b1ghp2t1hbddkurtrt9g'
  }
});

const response = await client.responses.create({
  prompt: {
    id: 'fvtj28tkcekgdt6rnm2v'
  },
  input: 'some message'
});

console.log(response.output_text);