// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState } from 'react';
import { login } from '../../axios/wellService';
const Login = ({
  onLogin
}) => {
  if (stryMutAct_9fa48("692")) {
    {}
  } else {
    stryCov_9fa48("692");
    const [credentials, setCredentials] = useState(stryMutAct_9fa48("693") ? {} : (stryCov_9fa48("693"), {
      login: stryMutAct_9fa48("694") ? "Stryker was here!" : (stryCov_9fa48("694"), ''),
      password: stryMutAct_9fa48("695") ? "Stryker was here!" : (stryCov_9fa48("695"), '')
    }));
    const [loading, setLoading] = useState(stryMutAct_9fa48("696") ? true : (stryCov_9fa48("696"), false));
    const [error, setError] = useState(stryMutAct_9fa48("697") ? "Stryker was here!" : (stryCov_9fa48("697"), ''));
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("698")) {
        {}
      } else {
        stryCov_9fa48("698");
        e.preventDefault();
        setLoading(stryMutAct_9fa48("699") ? false : (stryCov_9fa48("699"), true));
        setError(stryMutAct_9fa48("700") ? "Stryker was here!" : (stryCov_9fa48("700"), ''));
        try {
          if (stryMutAct_9fa48("701")) {
            {}
          } else {
            stryCov_9fa48("701");
            const response = await login(credentials);
            const userData = response.data;

            // Store user data in localStorage
            localStorage.setItem(stryMutAct_9fa48("702") ? "" : (stryCov_9fa48("702"), 'user'), JSON.stringify(userData));
            onLogin(userData);
          }
        } catch (error) {
          if (stryMutAct_9fa48("703")) {
            {}
          } else {
            stryCov_9fa48("703");
            console.error(stryMutAct_9fa48("704") ? "" : (stryCov_9fa48("704"), 'Login error:'), error);
            if (stryMutAct_9fa48("707") ? error.response?.status !== 401 : stryMutAct_9fa48("706") ? false : stryMutAct_9fa48("705") ? true : (stryCov_9fa48("705", "706", "707"), (stryMutAct_9fa48("708") ? error.response.status : (stryCov_9fa48("708"), error.response?.status)) === 401)) {
              if (stryMutAct_9fa48("709")) {
                {}
              } else {
                stryCov_9fa48("709");
                setError(stryMutAct_9fa48("710") ? "" : (stryCov_9fa48("710"), 'Неверный логин или пароль'));
              }
            } else {
              if (stryMutAct_9fa48("711")) {
                {}
              } else {
                stryCov_9fa48("711");
                setError(stryMutAct_9fa48("712") ? "" : (stryCov_9fa48("712"), 'Ошибка подключения к серверу'));
              }
            }
          }
        } finally {
          if (stryMutAct_9fa48("713")) {
            {}
          } else {
            stryCov_9fa48("713");
            setLoading(stryMutAct_9fa48("714") ? true : (stryCov_9fa48("714"), false));
          }
        }
      }
    };
    const handleChange = e => {
      if (stryMutAct_9fa48("715")) {
        {}
      } else {
        stryCov_9fa48("715");
        setCredentials(stryMutAct_9fa48("716") ? {} : (stryCov_9fa48("716"), {
          ...credentials,
          [e.target.name]: e.target.value
        }));
      }
    };
    return <div style={stryMutAct_9fa48("717") ? {} : (stryCov_9fa48("717"), {
      minHeight: stryMutAct_9fa48("718") ? "" : (stryCov_9fa48("718"), '100vh'),
      display: stryMutAct_9fa48("719") ? "" : (stryCov_9fa48("719"), 'flex'),
      alignItems: stryMutAct_9fa48("720") ? "" : (stryCov_9fa48("720"), 'center'),
      justifyContent: stryMutAct_9fa48("721") ? "" : (stryCov_9fa48("721"), 'center'),
      backgroundColor: stryMutAct_9fa48("722") ? "" : (stryCov_9fa48("722"), '#1a1a1f'),
      fontFamily: stryMutAct_9fa48("723") ? "" : (stryCov_9fa48("723"), 'Arial, sans-serif')
    })}>
      <div style={stryMutAct_9fa48("724") ? {} : (stryCov_9fa48("724"), {
        backgroundColor: stryMutAct_9fa48("725") ? "" : (stryCov_9fa48("725"), '#2d2d32'),
        padding: stryMutAct_9fa48("726") ? "" : (stryCov_9fa48("726"), '40px'),
        borderRadius: stryMutAct_9fa48("727") ? "" : (stryCov_9fa48("727"), '8px'),
        boxShadow: stryMutAct_9fa48("728") ? "" : (stryCov_9fa48("728"), '0 4px 20px rgba(0, 0, 0, 0.3)'),
        width: stryMutAct_9fa48("729") ? "" : (stryCov_9fa48("729"), '100%'),
        maxWidth: stryMutAct_9fa48("730") ? "" : (stryCov_9fa48("730"), '400px')
      })}>
        <h2 style={stryMutAct_9fa48("731") ? {} : (stryCov_9fa48("731"), {
          textAlign: stryMutAct_9fa48("732") ? "" : (stryCov_9fa48("732"), 'center'),
          color: stryMutAct_9fa48("733") ? "" : (stryCov_9fa48("733"), '#ffffff'),
          marginBottom: stryMutAct_9fa48("734") ? "" : (stryCov_9fa48("734"), '30px'),
          fontSize: stryMutAct_9fa48("735") ? "" : (stryCov_9fa48("735"), '24px'),
          fontWeight: stryMutAct_9fa48("736") ? "" : (stryCov_9fa48("736"), '600')
        })}>
          Вход в систему
        </h2>
        
        <div onSubmit={handleSubmit}>
          <div style={stryMutAct_9fa48("737") ? {} : (stryCov_9fa48("737"), {
            marginBottom: stryMutAct_9fa48("738") ? "" : (stryCov_9fa48("738"), '20px')
          })}>
            <label style={stryMutAct_9fa48("739") ? {} : (stryCov_9fa48("739"), {
              display: stryMutAct_9fa48("740") ? "" : (stryCov_9fa48("740"), 'block'),
              color: stryMutAct_9fa48("741") ? "" : (stryCov_9fa48("741"), '#ffffff'),
              marginBottom: stryMutAct_9fa48("742") ? "" : (stryCov_9fa48("742"), '8px'),
              fontSize: stryMutAct_9fa48("743") ? "" : (stryCov_9fa48("743"), '14px')
            })}>
              Логин
            </label>
            <input type="text" name="login" value={credentials.login} onChange={handleChange} required style={stryMutAct_9fa48("744") ? {} : (stryCov_9fa48("744"), {
              width: stryMutAct_9fa48("745") ? "" : (stryCov_9fa48("745"), '100%'),
              padding: stryMutAct_9fa48("746") ? "" : (stryCov_9fa48("746"), '12px'),
              borderRadius: stryMutAct_9fa48("747") ? "" : (stryCov_9fa48("747"), '4px'),
              border: stryMutAct_9fa48("748") ? "" : (stryCov_9fa48("748"), '1px solid #555'),
              backgroundColor: stryMutAct_9fa48("749") ? "" : (stryCov_9fa48("749"), '#1a1a1f'),
              color: stryMutAct_9fa48("750") ? "" : (stryCov_9fa48("750"), '#ffffff'),
              fontSize: stryMutAct_9fa48("751") ? "" : (stryCov_9fa48("751"), '14px'),
              boxSizing: stryMutAct_9fa48("752") ? "" : (stryCov_9fa48("752"), 'border-box')
            })} placeholder="Введите логин" />
          </div>
          
          <div style={stryMutAct_9fa48("753") ? {} : (stryCov_9fa48("753"), {
            marginBottom: stryMutAct_9fa48("754") ? "" : (stryCov_9fa48("754"), '30px')
          })}>
            <label style={stryMutAct_9fa48("755") ? {} : (stryCov_9fa48("755"), {
              display: stryMutAct_9fa48("756") ? "" : (stryCov_9fa48("756"), 'block'),
              color: stryMutAct_9fa48("757") ? "" : (stryCov_9fa48("757"), '#ffffff'),
              marginBottom: stryMutAct_9fa48("758") ? "" : (stryCov_9fa48("758"), '8px'),
              fontSize: stryMutAct_9fa48("759") ? "" : (stryCov_9fa48("759"), '14px')
            })}>
              Пароль
            </label>
            <input type="password" name="password" value={credentials.password} onChange={handleChange} required style={stryMutAct_9fa48("760") ? {} : (stryCov_9fa48("760"), {
              width: stryMutAct_9fa48("761") ? "" : (stryCov_9fa48("761"), '100%'),
              padding: stryMutAct_9fa48("762") ? "" : (stryCov_9fa48("762"), '12px'),
              borderRadius: stryMutAct_9fa48("763") ? "" : (stryCov_9fa48("763"), '4px'),
              border: stryMutAct_9fa48("764") ? "" : (stryCov_9fa48("764"), '1px solid #555'),
              backgroundColor: stryMutAct_9fa48("765") ? "" : (stryCov_9fa48("765"), '#1a1a1f'),
              color: stryMutAct_9fa48("766") ? "" : (stryCov_9fa48("766"), '#ffffff'),
              fontSize: stryMutAct_9fa48("767") ? "" : (stryCov_9fa48("767"), '14px'),
              boxSizing: stryMutAct_9fa48("768") ? "" : (stryCov_9fa48("768"), 'border-box')
            })} placeholder="Введите пароль" onKeyPress={e => {
              if (stryMutAct_9fa48("769")) {
                {}
              } else {
                stryCov_9fa48("769");
                if (stryMutAct_9fa48("772") ? e.key !== 'Enter' : stryMutAct_9fa48("771") ? false : stryMutAct_9fa48("770") ? true : (stryCov_9fa48("770", "771", "772"), e.key === (stryMutAct_9fa48("773") ? "" : (stryCov_9fa48("773"), 'Enter')))) {
                  if (stryMutAct_9fa48("774")) {
                    {}
                  } else {
                    stryCov_9fa48("774");
                    handleSubmit(e);
                  }
                }
              }
            }} />
          </div>
          
          {stryMutAct_9fa48("777") ? error || <div style={{
            backgroundColor: '#ff4444',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
              {error}
            </div> : stryMutAct_9fa48("776") ? false : stryMutAct_9fa48("775") ? true : (stryCov_9fa48("775", "776", "777"), error && <div style={stryMutAct_9fa48("778") ? {} : (stryCov_9fa48("778"), {
            backgroundColor: stryMutAct_9fa48("779") ? "" : (stryCov_9fa48("779"), '#ff4444'),
            color: stryMutAct_9fa48("780") ? "" : (stryCov_9fa48("780"), '#ffffff'),
            padding: stryMutAct_9fa48("781") ? "" : (stryCov_9fa48("781"), '10px'),
            borderRadius: stryMutAct_9fa48("782") ? "" : (stryCov_9fa48("782"), '4px'),
            marginBottom: stryMutAct_9fa48("783") ? "" : (stryCov_9fa48("783"), '20px'),
            fontSize: stryMutAct_9fa48("784") ? "" : (stryCov_9fa48("784"), '14px'),
            textAlign: stryMutAct_9fa48("785") ? "" : (stryCov_9fa48("785"), 'center')
          })}>
              {error}
            </div>)}
          
          <button type="button" onClick={handleSubmit} disabled={loading} style={stryMutAct_9fa48("786") ? {} : (stryCov_9fa48("786"), {
            width: stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), '100%'),
            padding: stryMutAct_9fa48("788") ? "" : (stryCov_9fa48("788"), '12px'),
            backgroundColor: loading ? stryMutAct_9fa48("789") ? "" : (stryCov_9fa48("789"), '#666') : stryMutAct_9fa48("790") ? "" : (stryCov_9fa48("790"), '#007bff'),
            color: stryMutAct_9fa48("791") ? "" : (stryCov_9fa48("791"), '#ffffff'),
            border: stryMutAct_9fa48("792") ? "" : (stryCov_9fa48("792"), 'none'),
            borderRadius: stryMutAct_9fa48("793") ? "" : (stryCov_9fa48("793"), '4px'),
            fontSize: stryMutAct_9fa48("794") ? "" : (stryCov_9fa48("794"), '16px'),
            fontWeight: stryMutAct_9fa48("795") ? "" : (stryCov_9fa48("795"), '600'),
            cursor: loading ? stryMutAct_9fa48("796") ? "" : (stryCov_9fa48("796"), 'not-allowed') : stryMutAct_9fa48("797") ? "" : (stryCov_9fa48("797"), 'pointer'),
            transition: stryMutAct_9fa48("798") ? "" : (stryCov_9fa48("798"), 'background-color 0.2s')
          })}>
            {loading ? stryMutAct_9fa48("799") ? "" : (stryCov_9fa48("799"), 'Вход...') : stryMutAct_9fa48("800") ? "" : (stryCov_9fa48("800"), 'Войти')}
          </button>
        </div>
      </div>
    </div>;
  }
};
export default Login;