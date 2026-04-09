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
import React from "react";
import Square from "../Square/Square";
import styles from "./Pumps.module.css";
/**
 * Pumps Component
 * 
 * @param {number} numberOfSquares - Number of pump squares to display
 * @param {number} width - Width of each square
 * @param {number} height - Height of each square
 * @param {number} activeIndex - (DEPRECATED) Legacy prop for backward compatibility
 * @param {Array<{tag: string, status: number|boolean, label: string}>} pumpStatuses - Array of pump status objects
 * @param {boolean} vertical - If true, arrange pumps vertically instead of horizontally
 * @param {number} gap - Gap between pumps in pixels (default: 0)
 * @param {boolean} showLabels - If true, show text labels instead of pump icons
 * @param {number} fontSize - Font size for labels in pixels (default: 15)
 *   Example: [
 *     { tag: "gnu_1_status", status: 1 },
 *     { tag: "gnu_2_status", status: 0 },
 *     { tag: "gnu_3_status", status: 1 }
 *   ]
 */
export default function Pumps({
  numberOfSquares,
  activeIndex = stryMutAct_9fa48("801") ? +1 : (stryCov_9fa48("801"), -1),
  width,
  height,
  pumpStatuses = stryMutAct_9fa48("802") ? ["Stryker was here"] : (stryCov_9fa48("802"), []),
  vertical = stryMutAct_9fa48("803") ? true : (stryCov_9fa48("803"), false),
  gap = 0,
  showLabels = stryMutAct_9fa48("804") ? true : (stryCov_9fa48("804"), false),
  fontSize = 15
}) {
  if (stryMutAct_9fa48("805")) {
    {}
  } else {
    stryCov_9fa48("805");
    return <div className={styles.container}>
      <div className={vertical ? styles.gridVertical : styles.grid} style={stryMutAct_9fa48("806") ? {} : (stryCov_9fa48("806"), {
        gap: stryMutAct_9fa48("807") ? `` : (stryCov_9fa48("807"), `${gap}px`)
      })}>
        {Array.from(stryMutAct_9fa48("808") ? {} : (stryCov_9fa48("808"), {
          length: numberOfSquares
        })).map((_, index) => {
          if (stryMutAct_9fa48("809")) {
            {}
          } else {
            stryCov_9fa48("809");
            let isActive = stryMutAct_9fa48("810") ? true : (stryCov_9fa48("810"), false);
            let label = stryMutAct_9fa48("811") ? "Stryker was here!" : (stryCov_9fa48("811"), "");

            // If pumpStatuses is provided, use it
            if (stryMutAct_9fa48("815") ? pumpStatuses.length <= 0 : stryMutAct_9fa48("814") ? pumpStatuses.length >= 0 : stryMutAct_9fa48("813") ? false : stryMutAct_9fa48("812") ? true : (stryCov_9fa48("812", "813", "814", "815"), pumpStatuses.length > 0)) {
              if (stryMutAct_9fa48("816")) {
                {}
              } else {
                stryCov_9fa48("816");
                const pumpStatus = pumpStatuses[index];
                if (stryMutAct_9fa48("818") ? false : stryMutAct_9fa48("817") ? true : (stryCov_9fa48("817", "818"), pumpStatus)) {
                  if (stryMutAct_9fa48("819")) {
                    {}
                  } else {
                    stryCov_9fa48("819");
                    // Handle different status formats
                    if (stryMutAct_9fa48("822") ? typeof pumpStatus.status !== 'number' : stryMutAct_9fa48("821") ? false : stryMutAct_9fa48("820") ? true : (stryCov_9fa48("820", "821", "822"), typeof pumpStatus.status === (stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), 'number')))) {
                      if (stryMutAct_9fa48("824")) {
                        {}
                      } else {
                        stryCov_9fa48("824");
                        isActive = stryMutAct_9fa48("827") ? pumpStatus.status !== 1 : stryMutAct_9fa48("826") ? false : stryMutAct_9fa48("825") ? true : (stryCov_9fa48("825", "826", "827"), pumpStatus.status === 1);
                      }
                    } else if (stryMutAct_9fa48("830") ? typeof pumpStatus.status !== 'boolean' : stryMutAct_9fa48("829") ? false : stryMutAct_9fa48("828") ? true : (stryCov_9fa48("828", "829", "830"), typeof pumpStatus.status === (stryMutAct_9fa48("831") ? "" : (stryCov_9fa48("831"), 'boolean')))) {
                      if (stryMutAct_9fa48("832")) {
                        {}
                      } else {
                        stryCov_9fa48("832");
                        isActive = pumpStatus.status;
                      }
                    } else if (stryMutAct_9fa48("835") ? typeof pumpStatus.status !== 'string' : stryMutAct_9fa48("834") ? false : stryMutAct_9fa48("833") ? true : (stryCov_9fa48("833", "834", "835"), typeof pumpStatus.status === (stryMutAct_9fa48("836") ? "" : (stryCov_9fa48("836"), 'string')))) {
                      if (stryMutAct_9fa48("837")) {
                        {}
                      } else {
                        stryCov_9fa48("837");
                        isActive = stryMutAct_9fa48("840") ? pumpStatus.status === '1' && pumpStatus.status.toLowerCase() === 'true' : stryMutAct_9fa48("839") ? false : stryMutAct_9fa48("838") ? true : (stryCov_9fa48("838", "839", "840"), (stryMutAct_9fa48("842") ? pumpStatus.status !== '1' : stryMutAct_9fa48("841") ? false : (stryCov_9fa48("841", "842"), pumpStatus.status === (stryMutAct_9fa48("843") ? "" : (stryCov_9fa48("843"), '1')))) || (stryMutAct_9fa48("845") ? pumpStatus.status.toLowerCase() !== 'true' : stryMutAct_9fa48("844") ? false : (stryCov_9fa48("844", "845"), (stryMutAct_9fa48("846") ? pumpStatus.status.toUpperCase() : (stryCov_9fa48("846"), pumpStatus.status.toLowerCase())) === (stryMutAct_9fa48("847") ? "" : (stryCov_9fa48("847"), 'true')))));
                      }
                    }

                    // Get label if provided
                    label = stryMutAct_9fa48("850") ? pumpStatus.label && "" : stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849", "850"), pumpStatus.label || (stryMutAct_9fa48("851") ? "Stryker was here!" : (stryCov_9fa48("851"), "")));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("852")) {
                {}
              } else {
                stryCov_9fa48("852");
                // Fallback to old activeIndex logic for backward compatibility
                isActive = stryMutAct_9fa48("855") ? index !== activeIndex : stryMutAct_9fa48("854") ? false : stryMutAct_9fa48("853") ? true : (stryCov_9fa48("853", "854", "855"), index === activeIndex);
              }
            }
            return <Square key={index} isActive={isActive} width={width} height={height} showLabel={showLabels} label={label} />;
          }
        })}
      </div>
    </div>;
  }
}