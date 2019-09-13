// ==UserScript==
// @name         StreamCraft Helper Native
// @namespace    https://streamcraft.com/
// @version      1.0.0
// @description  StreamCraft help script written in native javascript.
// @author       アニメちゃん
// @match        https://streamcraft.com/*
// @grant        none
// ==/UserScript==

((function () {
  function observe(target, config, callback) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => callback(mutation, observer));
    });

    observer.observe(target, config);
    return observer;
  }

  function createElement(tagName, params) {
    const {
      id,
      className,
      style,
      childList,
      type,
      innerTExt,
      events,
    } = params;

    const el = document.createElement(tagName);

    if (typeof id === 'string') {
      el.id = id;
    }

    if (typeof type === 'string') {
      el.type = type;
    }

    if (typeof innerTExt === 'string') {
      el.innerText = innerTExt;
    }

    if (typeof className === 'object') {
      Object.values(className).forEach((classValue) => {
        if (!classValue) {
          return;
        }

        el.classList.add(classValue);
      });
    }

    if (typeof events === 'object') {
      Object.entries(events).forEach(([name, event]) => {
        el.addEventListener(name, event);
      });
    }

    if (typeof childList === 'object') {
      Object.values(childList).forEach((child) => {
        el.appendChild(child);
      });
    }

    if (typeof style === 'object') {
      Object.entries(style).forEach(([name, styleValue]) => {
        el.style[name] = styleValue;
      });
    }

    return el;
  }

  function toggle(event, on, off) {
    if (event.button !== 0) {
      return;
    }

    const label = event.path.find(el => el.classList.contains('el-checkbox'));
    if (label.classList.contains('is-checked')) {
      label.classList.remove('is-checked');
      label.childNodes[0].classList.remove('is-checked');

      off();
      return;
    }

    label.classList.add('is-checked');
    label.childNodes[0].classList.add('is-checked');

    on();
  }

  const LATENCY = 1;

  let likeInterval;
  let chestInterval;
  let messagesObserver;

  let isChatLimitCanceled = false;

  for (let [key, value] of Object.entries(localStorage)) {
    if (/room_/.test(key)) {
      isChatLimitCanceled = JSON.parse(value).cfg.ChatConf.ChatContentLen === Number.MAX_SAFE_INTEGER;
    }
  }

  document.body.appendChild(createElement('style', {
    childList: [document.createTextNode([
      '::-webkit-scrollbar { width: 5px }',
      '::-webkit-scrollbar-track { background: #303031 }',
      '::-webkit-scrollbar-thumb { background: #47474a }',
      '::-webkit-scrollbar-thumb:hover { background: #71767c }',
      // Theatre mode
      '.contaniner-fix { padding-top: 0 !important }',
      '.header-fix { display: none !important }',
      '.channel-sider-fix { top: 0 !important; width: 410px !important }',
      '.chat-lists-fix { padding-right: 5px !important }',
      '.room-wrapper-fix { padding-right: 410px !important }',
      '.side-bar-fix { display: none !important }',
      '.content-fix { margin-left: 0 !important }',
      '.channel-fix { padding-top: 0 !important; height: 100vh; overflow: auto }',
    ].join('\n'))],
  }));

  observe(document.body, { childList: true, subtree: true }, (genaralMutation, generalObserver) => {
    const { target } = genaralMutation;

    const aboutStream = target.querySelector('.bulletin-board');
    if (aboutStream) {
      observe(aboutStream, { childList: true }, (mutation, observer) => {
        observer.disconnect();

        if (mutation.addedNodes.length > 0) {
          const p = mutation.target.querySelector('p');
          p.innerHTML = p.innerText;
        }
      });
    }

    const chatDialog = document.querySelector('.chat-dialog');
    if (chatDialog) {
      generalObserver.disconnect();

      if (chatDialog.querySelector('#userscript-settings')) {
        return;
      }

      const userscriptSettings = createElement('div', {
        style: {
          marginLeft: '7px',
          userSelect: 'none',
        },
        className: ['manage-im'],
        childList: [
          createElement('i', {
            style: {
              filter: 'invert(.25641)',
            },
            className: ['icon', 'set-icon'],
          }),
          createElement('div', {
            id: 'userscript-settings',
            style: {
              display: 'none',
            },
            className: ['manage-bar'],
            childList: [
              createElement('h4', {
                innerTExt: 'Настройки отображения',
              }),
              createElement('div', {
                className: ['manage-list'],
                childList: [
                  // Режим кинотеатра
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Режим кинотеатра',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            const classList = [
                              'contaniner',
                              'header',
                              'channel-sider',
                              'chat-lists',
                              'room-wrapper',
                              'side-bar',
                              'content',
                              'channel',
                              'channel',
                            ];

                            toggle(
                              event,
                              () => {
                                classList.forEach((className) => {
                                  document.querySelector(`.${className}`).classList.add(`${className}-fix`);
                                });
                              },
                              () => {
                                classList.forEach((className) => {
                                  document.querySelector(`.${className}`).classList.remove(`${className}-fix`);
                                });
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                  // Закрепить плеер
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Закрепить плеер',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            toggle(
                              event,
                              () => {
                                document.body.style.overflow = 'hidden';
                              },
                              () => {
                                document.body.style.overflow = '';
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                  // Скрыть анимацию лайков
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Скрыть анимацию лайков',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            const hearts = document.querySelector('.hearts');

                            toggle(
                              event,
                              () => {
                                hearts.style.display = 'none';
                              },
                              () => {
                                hearts.style.display = '';
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                  // Скрыть панель рейтинга и VIP
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Скрыть панель рейтинга и VIP',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            const panel = document.querySelector('.contribution-guard');

                            toggle(
                              event,
                              () => {
                                panel.style.display = 'none';
                              },
                              () => {
                                panel.style.display = '';
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                ],
              }),
              createElement('h4', {
                innerTExt: 'Автоматизация',
              }),
              createElement('div', {
                className: ['manage-list'],
                childList: [
                  // Лайки
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Лайки',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            toggle(
                              event,
                              () => {
                                likeInterval = setInterval(() => {
                                  document.querySelector('.like').click();
                                }, LATENCY);
                              },
                              () => {
                                clearInterval(likeInterval);
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                  // Сундуки
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Сундуки',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            toggle(
                              event,
                              () => {
                                chestInterval = setInterval(() => {
                                  const chest = document.querySelector('.new-chest-bar .chest-icon');
                                  if (chest) {
                                    chest.click();
                                  }
                                }, LATENCY);
                              },
                              () => {
                                clearInterval(chestInterval);
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                ],
              }),
              createElement('h4', {
                innerTExt: 'Experimental',
              }),
              createElement('div', {
                className: ['manage-list'],
                childList: [
                  // Подсветка комментариев
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item'],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input'],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Подсветка комментариев',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            toggle(
                              event,
                              () => {
                                messagesObserver = new MutationObserver((mutations) => {
                                  for (let mutation of mutations) {
                                    const nickname = document.querySelector('.nick').innerText;
                                
                                    const [chatItem] = mutation.addedNodes;
                                    const chatMsg = chatItem.querySelector('p span:last-child');
                                    if (chatMsg && chatMsg.innerText.includes(nickname)) {
                                      chatItem.style.backgroundColor = '#820d0d';
                                    }
                                  }
                                });

                                messagesObserver.observe(document.getElementById('chatScreen'), { childList: true, subtree: true });
                              },
                              () => {
                                messagesObserver.disconnect();
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                  // Ограничение чата
                  createElement('p', {
                    childList: [
                      createElement('label', {
                        className: ['el-checkbox', 'manage-item', isChatLimitCanceled ? 'is-checked' : ''],
                        childList: [
                          createElement('span', {
                            className: ['el-checkbox__input', isChatLimitCanceled ? 'is-checked' : ''],
                            childList: [
                              createElement('span', {
                                className: ['el-checkbox__inner'],
                              }),
                              createElement('input', {
                                className: ['el-checkbox__original'],
                                type: 'checkbox',
                              }),
                            ],
                          }),
                          createElement('span', {
                            className: ['el-checkbox__label'],
                            innerTExt: 'Убрать ограничения чата',
                          }),
                        ],
                        events: {
                          mousedown: (event) => {
                            toggle(
                              event,
                              () => {
                                for (let [key, value] of Object.entries(localStorage)) {
                                  if (/room_/.test(key)) {
                                    const json = JSON.parse(value);
                                    localStorage.removeItem(key);
                                    localStorage.setItem(key, JSON.stringify({
                                      cfg: {
                                        ...json.cfg,
                                        ChatConf: {
                                          ChatContentLen: Number.MAX_SAFE_INTEGER,
                                          ChatInterval: 0,
                                          ChatRepeatCount: Number.MAX_SAFE_INTEGER,
                                        },
                                      },
                                    }));
                                  }
                                }
                              },
                              () => {
                                for (let [key, value] of Object.entries(localStorage)) {
                                  if (/room_/.test(key)) {
                                    const json = JSON.parse(value);
                                    localStorage.removeItem(key);
                                    localStorage.setItem(key, JSON.stringify({
                                      cfg: {
                                        ...json.cfg,
                                        ChatConf: {
                                          ChatContentLen: 100,
                                          ChatInterval: 3,
                                          ChatRepeatCount: 3,
                                        },
                                      },
                                    }));
                                  }
                                }
                              },
                            );
                          },
                        },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      userscriptSettings.addEventListener('mousedown', (event) => {
        if (event.button !== 0 || !event.target.classList.contains('icon')) {
          return;
        }

        const settingsList = document.querySelector('#userscript-settings');
        settingsList.style.display = settingsList.style.display === 'none' ? '' : 'none';
      });

      chatDialog.appendChild(userscriptSettings);
    }
  });
})());
