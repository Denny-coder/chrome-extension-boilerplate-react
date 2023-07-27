/*
 * @Author: k.zheng k.zheng@trip.com
 * @Date: 2023-07-24 18:40:33
 * @LastEditors: k.zheng k.zheng@trip.com
 * @LastEditTime: 2023-07-26 20:22:05
 * @FilePath: /chrome-extension-boilerplate-react/src/pages/tsToJSON/tsToJSON copy.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useRef, useState } from 'react';

const statusMap = {
  1: '检测中',
  2: '检测成功',
  3: '检测失败',
}

const SharkPageId = () => {
  const [status, setStatus] = useState()
  const [statusTips, setStatusTips] = useState()
  const [appidWithpageIds, setAppidWithpageIds] = useState()
  const [sharkToken, setSharkToken] = useState()
  const textareaRef = useRef()
  function loadPlugin() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
      window.location.reload()
    });
  }
  async function getPageId() {
    setStatus(1)
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {

      // send msg to content script with new active mode
      chrome.tabs.sendMessage(tabs[0].id, { type: 'getPageInfo' }, clientInfo => {
        if (JSON.stringify(clientInfo) !== '{}' && clientInfo) {
          console.log(clientInfo)
          const appids = Object.keys(clientInfo).join('_')
          var requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          const result = []
          fetch(`http://corp-shark-node-api-function.faas.qa.nt.ctripcorp.com/sharkKeyList?appids=${appids}&shark_token=${sharkToken ? sharkToken : '8429dcac92be89551b14867e4db82f95'}`, requestOptions)
            .then(response => response.text())
            .then(res => {
              const resParse = JSON.parse(res)
              if (Array.isArray(resParse?.sharkList)) {
                if (resParse?.sharkList.length) {
                  const appidKeyPageMap = resParse?.sharkList.reduce((total, item) => {
                    total[`${item.transKey}_${item.appID}`] = item.pageID.toString()
                    return total
                  }, {})
                  for (const appID in clientInfo) {
                    if (Object.hasOwnProperty.call(clientInfo, appID)) {
                      const appPage = Array.from(new Set(clientInfo[appID].reduce((total, transKey) => {
                        total.push(JSON.stringify({
                          "appid": appID, "pageid": appidKeyPageMap[`${transKey}_${appID}`]
                        }))
                        return total
                      }, [])))
                      result.push(appPage)
                    }
                  }
                  const tips = result.flat().join(",")
                  setAppidWithpageIds(tips)
                  setStatus(2)
                  chrome.tabs.sendMessage(tabs[0].id, { type: 'console', tips })

                } else {
                  setStatus(3)
                  setStatusTips(' shark拉取失败')
                }

              } else {
                setStatus(3)
                setStatusTips(resParse.message)
              }

            })
            .catch(error => { setStatus(3); console.log('error', error) });
        } else {
          setStatus(3)
          setStatusTips('获取页面依赖shark失败，请开启shark-plugin')
        }

      });
    });
  }
  function arrDuplicateRemoval() {
    try {
      const data = JSON.parse(textareaRef.current.value)
      const uniqueData = Array.from(new Set(data.map(JSON.stringify)), JSON.parse);
      uniqueData.sort((a, b) => {
        if (a.appid === b.appid) {
          return b.pageid.localeCompare(a.pageid);
        }
        return a.appid.localeCompare(b.appid);
      });
      chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'console', tips: JSON.stringify(uniqueData) })
      })

    } catch (error) {

    }
  }
  return (
    <div className="App" style={{
      fontSize: '15px'
    }}>
      {statusMap[status] ? <div style={{
        textAlign: 'center',
      }}>{statusMap[status]}</div> : null}
      {statusTips ? <div style={{
        textAlign: 'center',
      }}>{statusTips}</div> : null}
      {appidWithpageIds ? <div>{<div style={{ lineHeight: '30px' }}>{appidWithpageIds}</div>}</div> : null}
      <div>
        shark_token: <input type="text" onChange={(e) => {
          setSharkToken(e.target.value)
        }} />
      </div>
      <div style={{
        textAlign: 'center',
      }}>
        <button disabled={status === 1} onClick={loadPlugin}>重载插件</button>
        <button disabled={status === 1} onClick={getPageId}>获取appid</button>
      </div>
      <button disabled={status === 1} onClick={arrDuplicateRemoval}>shark配置去重(结果将打印在页面控制台)</button>
      <textarea ref={textareaRef} name="" id="" cols="30" rows="10"></textarea>
    </div >
  );
};

export default SharkPageId;
