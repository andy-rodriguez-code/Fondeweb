# original vs clone · 克隆评估报告

## 结论
- 原站 URL: https://fondefos.com.co/
- 克隆 URL: http://127.0.0.1:8899/
- 自动推断复杂度: L1
- 复刻模式建议: 视觉复刻 / 内容爆改
- 自动报告边界: 结构、数量、框架、console 可自动比；传入 visual-diff 后可纳入像素差异分。内容残留和法务仍需审计。

## 技术信号
| 项目 | 原站 | 克隆站 |
|---|---|---|
| title | Fondefos – Tu Fondo de Servicios | Fondefos – Tu Fondo de Servicios |
| lang | es-CO | es-CO |
| frameworks | none | none |
| scrollHeight | 3700 | 5456 |
| h1 | Tu Fondo de Servicios, ¡NOTIFONDO! | Tu Fondo de Servicios |

## 数量对比
| 指标 | 原站 | 克隆站 | 自动评分 |
|---|---:|---:|---:|
| sections | 18 | 10 | 3/5 |
| links | 58 | 58 | 5/5 |
| images | 21 | 16 | 4/5 |
| video | 0 | 0 | 5/5 |
| canvas | 0 | 0 | 5/5 |
| forms | 1 | 0 | 1/5 |
| buttons | 6 | 17 | 2/5 |
| inputs | 1 | 0 | 1/5 |
| interactive | 86 | 75 | 4/5 |
| scripts | 20 | 1 | 1/5 |

## 复刻评分
- 源证据: 3/5
- 结构保真: 1/5
- 视觉保真: 1/5
- 动效/交互: 5/5
- 响应式: 4/5
- 功能完整: 2/5
- 内容替换: 需人工看文案残留
- 法务/部署风险: 需人工核查 license / 素材

## Console
- 原站 console errors: 0
- 克隆 console errors: 0
- 原站 page errors: 0
- 克隆 page errors: 0

## 路由覆盖
- 原站路由: 25
- 克隆路由: 21
- 覆盖率: 4%
- 原站 route map: RECON/routes/original-route-map.json
- 克隆 route map: RECON/routes-clone/clone-route-map.json
- 缺失路由: /nosotros, /como-ser-asociado, /ahorro, /crediaportes-10, /credito-de-confianza, /credito-de-consumo-por-bonos, /credito-de-libre-inversion, /credito-de-impuestos-2, /credito-de-recreacion-y-turismo, /credito-educativo, /creditos-de-tesoreria, /tarjeta-express, /convenios, /beneficios, /estado-de-cuenta, /preguntas-frecuentes, /contactenos, /wp-content/uploads/2023/05/1.Formulario-de-Conocimiento-Personas-Naturales-y-Asociados-V2.pdf, /wp-content/uploads/2025/10/Formato_Fondefos.pdf, /decameron, /fitness-people, /royal_prestige, /calido_hogar, /calzado_patricia
- 额外路由: /estado-de-cuenta.html, /index.html, /nosotros.html, /como-ser-asociado.html, /ahorro.html, /crediaportes-10.html, /credito-de-confianza.html, /credito-de-consumo-por-bonos.html, /credito-de-libre-inversion.html, /credito-de-impuestos.html, /credito-de-recreacion-y-turismo.html, /credito-educativo.html, /creditos-de-tesoreria.html, /tarjeta-express.html, /convenios.html, /beneficios.html, /preguntas-frecuentes.html, /contactenos.html, /assets/docs/formato-afiliacion-fondefos.pdf, /assets/docs/formulario-conocimiento-personas-naturales.pdf


## 交互覆盖
- 未提供 interaction-probe 结果。交互站需要传 --original-interactions / --clone-interactions。


## 截图证据
- 原站侦察: RECON/original-recon.json
- 克隆侦察: RECON/clone-recon.json
- 像素差异: RECON/visual-diff-1440.json
- 像素差异率: 0.4650010691593353
- 原站截图: screenshots\original-1440.png, screenshots\original-768.png, screenshots\original-390.png
- 克隆截图: screenshots\clone-1440.png, screenshots\clone-768.png, screenshots\clone-390.png

## 已知缺口
- 未传入 visual-diff 时，视觉保真需要打开截图人工确认。
- 法务、素材授权、品牌替换完整度需要人工核查。
