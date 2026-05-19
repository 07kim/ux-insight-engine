const fs = require('fs');
const file = '/Users/mayugeyasai/個人/制作物/UXインサイト/UX.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Rewrite Prompts
content = content.replace(/const AI_PROMPTS = \{[\s\S]*?\/\/ 6\. UX企画の具体化/m, `const AI_PROMPTS = {
            ACTION_AUTO_COMPLETE: {
                system: "日常の消費行動や意思決定の例を一つだけ日本語で出力。例：プレミアム缶ビールを購入する",
                user: () => \`行動例を生成\`
            },
            PERSONA_AUTO_COMPLETE: {
                system: "入力された行動を行う典型的なユーザーペルソナ（名前・年齢・性別・職業・家族構成・性格・趣味・エピソード）を日本語で生成。",
                user: (action) => \`行動: \${action}\`
            },
            SETTINGS_AUTO_COMPLETE: {
                system: \`入力された行動とペルソナから以下を推論し出力:\n- context: 最終目的（「〇〇のため」というシンプルな表現）\n- flow: 行動フロー（親行動プロセスの箇条書き。入力行動はその中の一手段）\n- alternatives: 代替手段（カンマ区切り）\`,
                user: (action, personaInfo) => \`行動: \${action}\\n\\n\${personaInfo}\`
            },

            // --- 段階的分析プロンプト ---
            FULL_PHASE1: {
                system: \`あなたは行動経済学、認知心理学、人間中心設計に精通したシニアUXリサーチ戦略家です。「メカニズム解明型ペインポイントアプローチ」の【Step 1】を実行してください。\n\n[ペルソナの反映]\n入力された全ペルソナ要素（年齢、性別、職業、家族構成、性格、趣味、エピソード）をくまなく掛け合わせ、最大限に反映してください。ペルソナ設定が異なれば、行動フローやペインポイントは全く違う結果になります。ペルソナ未提供時は行動から典型的ユーザー像を推測し出力に含めてください。\n\n[文脈] 生活のどの「秩序」を取り戻すためか。「〇〇のため」というシンプルな表現に。\n\n[行動フロー] 最終目的を達成するためのプロセスを、「楽しむ」「リラックスする」などの抽象度が高い親行動のフェーズ(stepName)として4〜5段階で構築。ペルソナ特有の行動を組み込み、ターゲット行動をいずれかに位置づけます。各ステップに「具体的な子行動(action)」と「複数の代替手段(alternatives)」を挙げてください。\n\n[合理的メカニズム] ターゲット行動の選択に至るメカニズム。\n1. ユーザーの条件 (userConditions): そのペルソナ特有の状況下で求めているものや制約条件を2〜4つ\n2. 選択メカニズム (selectionMechanism): 上記の条件を満たすものとして、なぜ他の代替手段ではなくそのターゲット行動を選択したのか。\n\n※全て日本語で指定されたJSONスキーマに従い出力してください。\`,
                user: (actionText, manualInputs) => \`ターゲット行動: 「\${actionText}」\\n\${manualInputs}\`
            },
            FULL_PHASE2: {
                system: \`「メカニズム解明型ペインポイントアプローチ」の【Step 2】を実行してください。Step 1で導き出された行動フローと選択メカニズムを基に、ペインポイントと代替手段の限界を深く分析します。\n\n[構造的ペイン] 優れた手段を選んだ副作用と、捨てられない制約の板挟み構造。ペルソナの固有設定に基づき、解決したい・怒る葛藤などをなるべく特異な視点で深く詳細に分析しペインポイントを複数挙げること。\n\n[代替手段の限界] ターゲット行動以外の回避策（フロー内で挙げられた代替手段）がなぜ選択されないのか、何が満足度を下げるのか詳細に分析すること。\n\n※全て日本語で指定されたJSONスキーマに従い出力してください。\`,
                user: (phase1Data) => \`【Step 1の分析結果（前提条件・フロー・メカニズム）】\\n\${phase1Data}\\n\\nこれらを基にペインポイントと代替手段の限界を構築してください。\`
            },
            FULL_PHASE3: {
                system: \`「メカニズム解明型ペインポイントアプローチ」の【Step 3】（最終ステップ）を実行してください。これまでの分析で抽出された全ての「ペイン」に対して解決策を提案します。\n\n[UX企画] UX企画(uxGain)は、以下の2つのソースから網羅的に提案してください。\n1. 構造的ペイン起点: 抽出した「構造的ペイン(painPoints)」のすべてに対して、1対1で解決する具体的な新プロダクトやサービス\n2. 代替手段の限界起点: 「代替手段の限界(alternativeAnalysis)」で挙げた【すべての代替案】について、その弱点を克服する具体的な解決策\n※UX企画の総数は、必ず「painPointsの数 ＋ alternativeAnalysisの数」と一致させること。各企画の targetPain には解決対象の名称を明記してください。\n\n※全て日本語で指定されたJSONスキーマに従い出力してください。\`,
                user: (phase1And2Data) => \`【これまでの分析結果（ペイン・代替手段の限界を含む）】\\n\${phase1And2Data}\\n\\nこれらを基に、全ての不満を解決するUX企画を網羅的に詳細に生成してください。\`
            },

            // 6. UX企画の具体化`);

// 2. Rewrite Schemas
content = content.replace(/const analysisSchema = \{[\s\S]*?async function fetchGemini/m, `const analysisSchemaP1 = {
            type: "OBJECT", required: ["context", "flow", "userConditions", "selectionMechanism"],
            properties: {
                persona: { type: "OBJECT", properties: { name: { type: "STRING" }, age: { type: "INTEGER" }, gender: { type: "STRING" }, occupation: { type: "STRING" }, family: { type: "STRING" }, hobbies: { type: "STRING" }, personality: { type: "STRING" }, episode: { type: "STRING" } } },
                context: { type: "STRING" },
                flow: { type: "ARRAY", items: { type: "OBJECT", properties: { stepName: { type: "STRING" }, action: { type: "STRING" }, alternatives: { type: "ARRAY", items: { type: "STRING" } }, isTargetAction: { type: "BOOLEAN" } }, required: ["stepName", "action", "alternatives"] } },
                userConditions: { type: "ARRAY", items: { type: "STRING" } },
                selectionMechanism: { type: "STRING" }
            }
        };
        const analysisSchemaP2 = {
            type: "OBJECT", required: ["painPoints", "alternativeAnalysis"],
            properties: {
                painPoints: { type: "ARRAY", items: { type: "STRING" } },
                alternativeAnalysis: { type: "ARRAY", items: { type: "OBJECT", properties: { alternative: { type: "STRING" }, reasonNotChosen: { type: "STRING" }, painPoint: { type: "STRING" } }, required: ["alternative", "reasonNotChosen", "painPoint"] } }
            }
        };
        const analysisSchemaP3 = {
            type: "OBJECT", required: ["uxGain"],
            properties: {
                uxGain: { type: "ARRAY", items: { type: "OBJECT", properties: { targetPain: { type: "STRING" }, title: { type: "STRING" }, description: { type: "STRING" } }, required: ["targetPain", "title", "description"] } }
            }
        };

        async function fetchGemini`);

// 3. Rewrite performFullAnalysis & Editing hooks & reanalyze
content = content.replace(/\/\/ --- Core Analysis ---[\s\S]*?function triggerManualReanalyzeBanner\(\) \{ els\.reanalyzeBanner\.classList\.remove\('opacity-0', 'translate-y-32'\); \}/m, `// --- Tracking Edits for Progressive Re-analysis ---
        let lowestEditedPhase = 3;
        function triggerManualReanalyzeBanner(phase) {
            if (phase < lowestEditedPhase) lowestEditedPhase = phase;
            if (lowestEditedPhase <= 2) {
                els.reanalyzeBanner.classList.remove('opacity-0', 'translate-y-32');
            }
        }

        // --- Core Analysis (Progressive) ---
        async function performFullAnalysis(actionText) {
            try {
                let gender = ""; Array.from(els.pGenderRadios).forEach(r => { if (r.checked) gender = r.value; });
                const baseManualInputs = \`[前提条件]\\n- ペルソナ: \${els.pName.value}, \${els.pAge.value}歳, \${gender}, \${els.pFamily.value}, 職業:\${els.pOccupation.value}, 性格:\${els.pPersonality.value}\\n- エピソード: \${els.pEpisode.value}\\n- 指定目的: \${els.mContext.value}\\n- 指定フロー: \${els.mFlow.value}\\n- 指定代替手段: \${els.mAlts.value}\`;

                // Phase 1
                showLoading(true, "AI Analyzing (1/3)...", "第一段階: ユーザーシナリオとメカニズムを構築中...");
                let p1Prompt = AI_PROMPTS.FULL_PHASE1;
                const phase1 = await fetchGemini(p1Prompt.user(actionText, baseManualInputs), analysisSchemaP1, p1Prompt.system);
                currentAnalysisData = { action: actionText, ...phase1 };

                // Auto-fill blanks based on Phase 1
                if (phase1.persona) {
                    if (!els.pName.value) els.pName.value = phase1.persona.name || '';
                    if (!els.pAge.value) els.pAge.value = phase1.persona.age || '';
                    if (!els.pOccupation.value) els.pOccupation.value = phase1.persona.occupation || '';
                    if (!els.pHobbies.value) els.pHobbies.value = phase1.persona.hobbies || '';
                    if (!els.pPersonality.value) els.pPersonality.value = phase1.persona.personality || '';
                    if (!els.pEpisode.value) { els.pEpisode.value = phase1.persona.episode || ''; setTimeout(() => { els.pEpisode.style.height = ''; els.pEpisode.style.height = els.pEpisode.scrollHeight + 'px'; }, 10); }
                }

                // Phase 2
                showLoading(true, "AI Analyzing (2/3)...", "第二段階: ペインポイントと代替手段の限界を分析中...");
                let p2Prompt = AI_PROMPTS.FULL_PHASE2;
                const phase2 = await fetchGemini(p2Prompt.user(JSON.stringify(phase1, null, 2)), analysisSchemaP2, p2Prompt.system);
                currentAnalysisData = { ...currentAnalysisData, ...phase2 };

                // Phase 3
                showLoading(true, "AI Analyzing (3/3)...", "第三段階: 全ペインを解決するUX企画を抽出中...");
                let p3Prompt = AI_PROMPTS.FULL_PHASE3;
                let phase1_2Data = JSON.stringify({ context: phase1.context, flow: phase1.flow, painPoints: phase2.painPoints, alternativeAnalysis: phase2.alternativeAnalysis }, null, 2);
                const phase3 = await fetchGemini(p3Prompt.user(phase1_2Data), analysisSchemaP3, p3Prompt.system);
                currentAnalysisData = { ...currentAnalysisData, ...phase3 };

                currentInterviewData = null; // Clear previous interviews
                renderResults(); switchMainTab(3); showSimpleToast("分析が完了しました");
            } catch (err) { showSimpleToast("分析処理でエラーが発生しました: " + err.message, 'error'); } finally { showLoading(false); }
        }

        // --- Inline Editing & Re-analysis ---`);

content = content.replace(/function cancelReanalyzeBanner\(\) \{ els.reanalyzeBanner.classList.add\('opacity-0', 'translate-y-32'\); \}/m, `function cancelReanalyzeBanner() { lowestEditedPhase = 3; els.reanalyzeBanner.classList.add('opacity-0', 'translate-y-32'); }`);

content = content.replace(/function handleEdit\(key, newValue\) \{ const val = newValue.trim\(\); if \(\!val \|\| currentAnalysisData\[key\] === val\) return; currentAnalysisData\[key\] = val; triggerManualReanalyzeBanner\(\); \}/m, `function handleEdit(key, newValue) { const val = newValue.trim(); if (!val || currentAnalysisData[key] === val) return; currentAnalysisData[key] = val; triggerManualReanalyzeBanner(2); }`); // Because editing context/mechanisms triggers Phase 2

content = content.replace(/function handleArrayEdit\(key, index, newValue\) \{ const val = newValue.trim\(\); if \(\!val\) \{ currentAnalysisData\[key\]\.splice\(index, 1\); renderResults\(\); triggerManualReanalyzeBanner\(\); return; \} if \(currentAnalysisData\[key\]\[index\] === val\) return; currentAnalysisData\[key\]\[index\] = val; triggerManualReanalyzeBanner\(\); \}/m, `function handleArrayEdit(key, index, newValue) { const val = newValue.trim(); if (!val) { currentAnalysisData[key].splice(index, 1); renderResults(); triggerManualReanalyzeBanner(key === 'painPoints' ? 3 : 2); return; } if (currentAnalysisData[key][index] === val) return; currentAnalysisData[key][index] = val; triggerManualReanalyzeBanner(key === 'painPoints' ? 3 : 2); }`);

content = content.replace(/function handleObjArrayEdit\(key, index, prop, newValue\) \{ const val = newValue.trim\(\); if \(currentAnalysisData\[key\]\[index\]\[prop\] === val\) return; currentAnalysisData\[key\]\[index\]\[prop\] = val; triggerManualReanalyzeBanner\(\); \}/m, `function handleObjArrayEdit(key, index, prop, newValue) { const val = newValue.trim(); if (currentAnalysisData[key][index][prop] === val) return; currentAnalysisData[key][index][prop] = val; triggerManualReanalyzeBanner(key === 'alternativeAnalysis' ? 3 : 2); }`);

content = content.replace(/function handleFlowObjEdit\(index, prop, newValue\) \{ const val = newValue.trim\(\); if \(currentAnalysisData\.flow\[index\]\[prop\] === val\) return; currentAnalysisData\.flow\[index\]\[prop\] = val; triggerManualReanalyzeBanner\(\); \}/m, `function handleFlowObjEdit(index, prop, newValue) { const val = newValue.trim(); if (currentAnalysisData.flow[index][prop] === val) return; currentAnalysisData.flow[index][prop] = val; triggerManualReanalyzeBanner(2); }`);

content = content.replace(/function handleFlowAltEdit\(stepIndex, altIndex, newValue\) \{/m, `function handleFlowAltEdit(stepIndex, altIndex, newValue) { let level = 2;`);
content = content.replace(/triggerManualReanalyzeBanner\(\); \}/m, `triggerManualReanalyzeBanner(level); }`);

content = content.replace(/function addFlowAlt\(stepIndex\) \{[\s\S]*?triggerManualReanalyzeBanner\(\); \}/m, `function addFlowAlt(stepIndex) { const newAltName = "新規代替手段"; ensureArray(currentAnalysisData.flow[stepIndex].alternatives).push(newAltName); ensureArray(currentAnalysisData.alternativeAnalysis).push({ alternative: newAltName, reasonNotChosen: "選ばなかった理由を入力...", painPoint: "生じるペインを入力..." }); renderResults(); triggerManualReanalyzeBanner(2); }`);
content = content.replace(/function addFlowStep\(index\) \{[\s\S]*?triggerManualReanalyzeBanner\(\); \}/m, `function addFlowStep(index) { currentAnalysisData.flow.splice(index, 0, { stepName: "新規親フェーズ", action: "行動を入力", alternatives: [], isTargetAction: false }); renderResults(); triggerManualReanalyzeBanner(2); }`);
content = content.replace(/function moveFlowStep\(index, direction\) \{[\s\S]*?triggerManualReanalyzeBanner\(\); \}/m, `function moveFlowStep(index, direction) { if (index + direction < 0 || index + direction >= currentAnalysisData.flow.length) return; const temp = currentAnalysisData.flow[index]; currentAnalysisData.flow[index] = currentAnalysisData.flow[index + direction]; currentAnalysisData.flow[index + direction] = temp; renderResults(); triggerManualReanalyzeBanner(2); }`);
content = content.replace(/function deleteFlowStep\(index\) \{[\s\S]*?triggerManualReanalyzeBanner\(\); \}/m, `function deleteFlowStep(index) { currentAnalysisData.flow.splice(index, 1); renderResults(); triggerManualReanalyzeBanner(2); }`);
content = content.replace(/function addArrayItem\(key\) \{[\s\S]*?renderResults\(\); triggerManualReanalyzeBanner\(\);/m, `function addArrayItem(key) {
            let level = 2;
            if (key === 'painPoints') { ensureArray(currentAnalysisData.painPoints).push("新しいペインポイントを入力..."); level = 3; }
            if (key === 'alternativeAnalysis') { ensureArray(currentAnalysisData.alternativeAnalysis).push({ alternative: "新しい代替手段", reasonNotChosen: "選ばなかった理由...", painPoint: "生じるペイン..." }); level = 3; }
            if (key === 'uxGain') { ensureArray(currentAnalysisData.uxGain).push({ targetPain: "解決するペイン...", title: "新しい提案のタイトル", description: "提案の詳細な説明..." }); level = 3; }
            renderResults(); triggerManualReanalyzeBanner(level);`);

content = content.replace(/function handleMechArrayEdit\(propName, index, newValue\) \{[\s\S]*?triggerManualReanalyzeBanner\(\);\n        \}/m, `function handleMechArrayEdit(propName, index, newValue) {
            const val = newValue.trim();
            if (!currentAnalysisData.userConditions) currentAnalysisData.userConditions = [];
            if (!val) { currentAnalysisData.userConditions.splice(index, 1); renderResults(); triggerManualReanalyzeBanner(2); return; }
            if (currentAnalysisData.userConditions[index] === val) return;
            currentAnalysisData.userConditions[index] = val; triggerManualReanalyzeBanner(2);
        }`);

content = content.replace(/function handleMechObjEdit\(propName, newValue\) \{[\s\S]*?triggerManualReanalyzeBanner\(\);\n        \}/m, `function handleMechObjEdit(propName, newValue) {
            const val = newValue.trim();
            if (currentAnalysisData.selectionMechanism === val) return;
            currentAnalysisData.selectionMechanism = val; triggerManualReanalyzeBanner(2);
        }`);

content = content.replace(/function addMechCondition\(\) \{[\s\S]*?triggerManualReanalyzeBanner\(\);\n        \}/m, `function addMechCondition() {
            if (!currentAnalysisData.userConditions) currentAnalysisData.userConditions = [];
            currentAnalysisData.userConditions.push("新しい条件を入力..."); renderResults(); triggerManualReanalyzeBanner(2);
        }`);

content = content.replace(/async function reanalyzeBasedOnEdits\(\) \{[\s\S]*?function deepDiveUxGain/m, `async function reanalyzeBasedOnEdits() {
            cancelReanalyzeBanner(); 
            try {
                // If lowestEditedPhase is 2, it means Phase 1 (Flow/Mechanisms) was edited, so we must regenerate Phase 2 & 3
                if (lowestEditedPhase === 2) {
                    showLoading(true, "AI Re-optimizing (2/3)...", "フロー・メカニズムの変更に合わせてペインと限界を再構築中...");
                    const phase1Str = JSON.stringify({ context: currentAnalysisData.context, flow: currentAnalysisData.flow, userConditions: currentAnalysisData.userConditions, selectionMechanism: currentAnalysisData.selectionMechanism }, null, 2);
                    let p2Prompt = AI_PROMPTS.FULL_PHASE2;
                    const phase2 = await fetchGemini(p2Prompt.user(phase1Str), analysisSchemaP2, p2Prompt.system);
                    currentAnalysisData = { ...currentAnalysisData, ...phase2 };
                    lowestEditedPhase = 3; // cascade down
                }

                // If lowestEditedPhase is 3, it means Phase 2 (Pains/Limits) was edited, or cascaded, so regenerate UX Gain
                if (lowestEditedPhase === 3) {
                    showLoading(true, "AI Re-optimizing (3/3)...", "変更されたペインに合わせてUX企画を再最適化中...");
                    let phase1_2Data = JSON.stringify({ context: currentAnalysisData.context, flow: currentAnalysisData.flow, painPoints: currentAnalysisData.painPoints, alternativeAnalysis: currentAnalysisData.alternativeAnalysis }, null, 2);
                    let p3Prompt = AI_PROMPTS.FULL_PHASE3;
                    const phase3 = await fetchGemini(p3Prompt.user(phase1_2Data), analysisSchemaP3, p3Prompt.system);
                    currentAnalysisData = { ...currentAnalysisData, ...phase3 };
                }

                renderResults(); showSimpleToast("一部を再最適化しました", true);
            } catch (err) { console.error(err); showSimpleToast("再分析エラー: " + err.message, 'error'); } finally { showLoading(false); }
        }

        // --- ✨ NEW LLM FEATURES ---
        async function deepDiveUxGain`);

fs.writeFileSync(file, content);
