调整文本转语音的逻辑，用户成功上传语音模型后，进行tts的参数选择，参数有input （输入，字符串，必填）、voice_id（模型Id，必填）、audio_format（输出音频格式，默认wav，允许wav、mp3、ogg、aac），model （音频合成的模型，simba-english或simba-multilingual）、options:{loudness_normalization（布尔值，Determines whether to normalize the audio loudness to a standard level.）、text_normalization（布尔值，Determines whether to normalize the text. If enabled, it will transform numbers, dates, etc. into words. For example, “55” is normalized into “fifty five”. This can increase latency due to additional processing required for text normalization.）}，之后通过api进行文本转语音，改写http请求：curl -X POST https://api.sws.speechify.com/v1/audio/speech \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
  "input": "input",
  "voice_id": "voice_id"
}'，其返回的数据格式为：{
  "audio_data": "audio_data",
  "audio_format": "wav",
  "billable_characters_count": 1000000,
  "speech_marks": {
    "chunks": [
      {}
    ],
    "end": 1000000,
    "end_time": 1.1,
    "start": 1000000,
    "start_time": 1.1,
    "type": "type",
    "value": "value"
  }
}