import React, { useRef } from 'react';
import './tsToJSON.css';
import './tsToJSON.scss';
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as babelTypes from '@babel/types';
import { Random } from "mockjs";

window.babelTypes = babelTypes
const TsToJSON = () => {
  const textareaRef = useRef('')
  const inputRef = useRef('')
  return (
    <div className="App">
      输入ts代码
      <textarea name="" id="" cols="50" rows="30" onChange={(e) => {
        textareaRef.current = e.target.value
      }}></textarea>
      <input type="text" onChange={(e) => {
        inputRef.current = e.target.value
      }} />
      <button onClick={() => {
        console.log(inputRef.current, textareaRef.current)
        const value = parser.parse(textareaRef.current, {
          plugins: ['typescript'],
          sourceType: 'module'
        })
        var genMockFactoy = {}
        traverse(value, {
          // ExportNamedDeclaration: (path) => {
          //   console.log('ExportNamedDeclaration', path)
          // },
          TSInterfaceDeclaration: (path) => {
            console.log(path)
            if (path.node.body.type === 'TSInterfaceBody') {

              genMockFactoy[path.node.id.name] = path.node.body.body.reduce((total, item) => {
                Object.defineProperty(total, item.key.name, {
                  enumerable: true,
                  configurable: false,
                  get: () => {
                    if (item.typeAnnotation.typeAnnotation.type === babelTypes.TSStringKeyword().type) {
                      return Random.string()
                    }
                    if (Array.isArray(item.typeAnnotation.typeAnnotation.types)) {
                      const notNullType = item.typeAnnotation.typeAnnotation.types.find(item => {
                        return !babelTypes.isTSNullKeyword(item)
                      })
                      if (!notNullType) {
                        return null
                      }
                      if (babelTypes.TSArrayType(notNullType)) {
                        return Array.from({ length: 3 }).map(() => genMockFactoy[notNullType.elementType.typeName.name])
                      }
                    }
                    return undefined
                  }
                })
                return total
              }, {})
            }

          },
          // TSEnumDeclaration: (path) => {
          //   console.log('TSEnumDeclaration', path)
          // },
          // TSTypeAliasDeclaration: (path) => {
          //   console.log('TSEnumDeclaration', path)
          // },
        });
        console.log(genMockFactoy)
      }}>开始mock</button>
    </div >
  );
};

export default TsToJSON;
