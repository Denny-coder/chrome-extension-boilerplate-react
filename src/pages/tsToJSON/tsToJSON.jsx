import React, { useRef } from 'react';
import './tsToJSON.css';
import './tsToJSON.scss';
import * as parser from '@babel/parser'


const TsToJSON = () => {
  const textareaRef = useRef('')
  return (
    <div className="App">
      输入ts代码
      <textarea name="" id="" cols="50" rows="30" onChange={(e) => {
        textareaRef.current = e.target.value
      }}></textarea>
      <button onClick={() => {
        console.log(parser, textareaRef.current)
        const value = parser.parse(textareaRef.current, {
          plugins: ['typescript'],
          sourceType: 'module'
        })
        console.log(value)
      }}>开始mock</button>
    </div>
  );
};

export default TsToJSON;
