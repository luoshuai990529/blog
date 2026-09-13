<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
const root = `${import.meta.env.BASE_URL}cache-demo/`
const record = ref(null)
const shown = ref(0)
const error = ref('')
const status = ref('正在读取实验记录…')
let timer
function stop() { clearInterval(timer); timer = null; playing.value = false }
const playing = ref(false)
function validate(data) {
  if (!data || data.schema_version !== 1 || data.kind !== 'measured') throw new Error('需要 schema_version=1、kind=measured 的实测结果。')
  if (typeof data.model !== 'string' || !data.model || (data.recorded_at !== null && (typeof data.recorded_at !== 'string' || !Number.isFinite(Date.parse(data.recorded_at))))) throw new Error('结果缺少模型或有效的测量时间；未知时间请使用 null。')
  if (!Array.isArray(data.samples) || !data.samples.length || data.samples.length > 100) throw new Error('结果需要 1–100 个样本。')
  for (const row of data.samples) {
    if (!['warmup','stable','changed'].includes(row.group) || !Number.isInteger(row.sample) || row.sample < 1) throw new Error('样本分组或编号无效。')
    for (const key of ['ttft_ms','prompt_tokens','hit_tokens','miss_tokens']) {
      if (row[key] !== null && (!Number.isFinite(row[key]) || row[key] < 0)) throw new Error('指标必须是非负数；缺失值请使用 null。')
      if (key !== 'ttft_ms' && row[key] !== null && !Number.isInteger(row[key])) throw new Error('Token 数必须是整数。')
    }
    if (row.prompt_tokens !== null && row.hit_tokens !== null && row.miss_tokens !== null && row.hit_tokens + row.miss_tokens !== row.prompt_tokens) throw new Error('样本命中数与未命中数之和不等于输入 token 数。')
  }
  for (const group of ['stable','changed']) {
    const rows = data.samples.filter(r => r.group === group)
    if (!rows.length || new Set(rows.map(r => r.sample)).size !== rows.length) throw new Error('两组都需要样本，且组内编号不能重复。')
  }
  return data
}
function apply(data) { stop(); record.value = validate(data); shown.value = 0; error.value = ''; status.value = '记录已就绪' }
onMounted(async () => {
  try {
    const response = await fetch(root + 'results.json', { cache: 'no-store' })
    if (!response.ok) throw new Error('实验记录暂时无法读取。')
    const data = await response.json()
    if (data === null) { status.value = '待录入真实实验记录'; return }
    apply(data)
  } catch (e) { status.value = '未加载实验记录'; error.value = e.message }
})
onBeforeUnmount(stop)
const samples = computed(() => record.value?.samples.filter(r => r.group !== 'warmup') ?? [])
const visible = computed(() => samples.value.slice(0, shown.value))
const scale = computed(() => Math.max(1, ...samples.value.map(r => r.ttft_ms ?? 0)))
const groups = [{ key: 'stable', title: '稳定前缀', detail: '组内复用同一份系统提示词' }, { key: 'changed', title: '改首前缀', detail: '逐次改变首行标记，其余文本不变' }]
function rows(group) { return visible.value.filter(r => r.group === group) }
function median(group) {
  const values = rows(group).map(r => r.ttft_ms).filter(v => v !== null).sort((a,b) => a-b)
  const n = values.length
  return n ? ((values[(n-1)>>1] + values[n>>1]) / 2).toFixed(1) + ' ms' : '—'
}
function rate(row) { return row.prompt_tokens > 0 && row.hit_tokens !== null ? (row.hit_tokens / row.prompt_tokens * 100).toFixed(2) + '%' : '缺失' }
function totals(group) {
  const valid = rows(group).filter(r => r.prompt_tokens > 0 && r.hit_tokens !== null)
  const input = valid.reduce((n,r) => n + r.prompt_tokens,0)
  const hit = valid.reduce((n,r) => n + r.hit_tokens,0)
  return input ? `${(hit/input*100).toFixed(2)}% · ${hit.toLocaleString()}/${input.toLocaleString()}` : '—'
}
function play() {
  if (playing.value) { stop(); return }
  if (shown.value >= samples.value.length) shown.value = 0
  playing.value = true
  shown.value++
  timer = setInterval(() => { shown.value++; if (shown.value >= samples.value.length) stop() }, 750)
}
function all() { stop(); shown.value = samples.value.length }
async function upload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    if (file.size > 250000) throw new Error('文件过大，请使用仅包含实验指标的 JSON。')
    const data = JSON.parse(await file.text()); validate(data); apply(data)
    status.value = '已载入本地记录，仅本浏览器可见'
  } catch (e) { error.value = e.message }
  event.target.value = ''
}
const timestamp = computed(() => record.value?.recorded_at ? new Date(record.value.recorded_at).toLocaleString() : '测量时间未提供')
</script>

<template>
  <div class="cache-replay" @click.stop @keydown.stop>
    <div class="replay-eyebrow">补充演示 / API Prompt Cache</div>
    <h1>同一份上下文，缓存命中有何不同？</h1>
    <div class="replay-toolbar">
      <span class="record-badge">{{ record ? '真实实验记录回放 · 非实时请求' : '待录入 · 尚无实验结果' }}</span>
      <button :disabled="!record" @click="play">{{ playing ? '暂停' : '播放记录' }}</button>
      <button :disabled="!record" @click="all">显示全部</button>
      <label class="upload-control">载入结果<input type="file" accept="application/json,.json" @change="upload"></label>
    </div>
    <div v-if="record" class="record-info">{{ record.model }} · {{ timestamp }} · {{ record.samples.filter(r=>r.group==='warmup').length }} 次预热不计入汇总 · {{ shown }}/{{ samples.length }} 条测量</div>
    <div v-else class="record-info">{{ status }}：收到真实数据后展示；此页面不会调用模型 API。</div>
    <div v-if="record?.method" class="record-method">{{ record.method }}</div>
    <div v-if="error" class="record-error" role="alert">{{ error }}</div>
    <div class="comparison">
      <section v-for="group in groups" :key="group.key" :class="`replay-${group.key}`">
        <h2>{{ group.title }}</h2><p>{{ group.detail }}</p>
        <div class="metric"><span>中位 TTFT</span><b>{{ median(group.key) }}</b></div>
        <div class="cache-total">缓存命中 {{ totals(group.key) }} <small>tokens</small></div>
        <div class="sample-label"><span>样本</span><span>首字延迟（ms）</span><span>缓存命中</span></div>
        <div class="sample-list">
          <div v-for="(row,i) in rows(group.key)" :key="row.sample" class="sample-row">
            <span>#{{ row.sample }}</span><div class="bar-track"><i :style="{width: `${Math.max(0,(row.ttft_ms ?? 0)/scale*100)}%`}"></i><b>{{ row.ttft_ms === null ? '缺失' : row.ttft_ms.toFixed(1) }}{{ row.error ? ' *' : '' }}</b></div><span :title="`命中 ${row.hit_tokens ?? '缺失'} / 输入 ${row.prompt_tokens ?? '缺失'}；未命中 ${row.miss_tokens ?? '缺失'}`">{{ rate(row) }}</span>
          </div>
          <div v-if="!rows(group.key).length" class="no-samples">{{ record ? '点击“播放记录”或“显示全部”' : '等待实测数据，不展示模拟数值' }}</div>
        </div>
      </section>
    </div>
    <div class="replay-footnote">以 API 返回的缓存 token 判定命中；TTFT 还受网络与服务负载影响。回放为固定节奏，非原始耗时。<br>* 表示样本部分失败；缺失指标不计入对应汇总。载入本地文件不会更新线上部署。</div>
    <div class="replay-downloads"><a :href="root+'deepseek_ttft_demo.ipynb'" download>下载原始 Notebook</a><a :href="root+'collect_replay.py'" download>下载结果采集脚本</a><a :href="root+'README.md'" download>运行与发布说明</a><span>{{ status }}</span></div>
  </div>
</template>

<style scoped>
.cache-replay{box-sizing:border-box;height:100%;padding:25px 38px 22px;background:#101719;color:#edf3ef;font-family:'PingFang SC',sans-serif;display:flex;flex-direction:column}
.replay-eyebrow{font-size:12px;color:#84d9b7;margin-bottom:6px}
h1{font-size:28px!important;line-height:1.3!important;margin:0 0 14px!important;font-weight:650}
.replay-toolbar{display:flex;gap:10px;align-items:center}
.record-badge{font-size:12px;color:#e8bd76;margin-right:auto}
button,.upload-control{font-size:12px;border:1px solid #48625b;border-radius:4px;padding:5px 11px;background:#1b302b;color:#edf3ef;cursor:pointer}
button:disabled{opacity:.4;cursor:default}input{display:none}button:focus-visible,a:focus-visible,.upload-control:focus-within{outline:2px solid #e8bd76}
.record-method{font-size:10px;color:#a7b7b4;margin:-6px 0 8px}.record-info{font-size:11px;color:#a7b7b4;margin:9px 0 11px}.record-error{font-size:12px;color:#f49b92;margin-bottom:7px}
.comparison{display:grid;grid-template-columns:1fr 1fr;gap:28px;min-height:0;flex:1}
section{border-top:2px solid #84d9b7;padding-top:10px;min-width:0;display:flex;flex-direction:column}.replay-changed{border-color:#e8bd76}
h2{font-size:22px!important;line-height:1.3!important;margin:0 0 4px!important}p{font-size:12px;line-height:1.5;margin:0 0 10px;color:#a7b7b4}
.metric{display:flex;align-items:baseline;justify-content:space-between;font-size:13px}.metric b{font-size:23px;font-weight:600;color:#84d9b7}.replay-changed .metric b{color:#e8bd76}
.cache-total{font-size:12px;color:#a7b7b4;margin:5px 0 11px}.cache-total small{font-size:10px}
.sample-label,.sample-row{display:grid;grid-template-columns:40px 1fr 72px;gap:8px;font-size:12px;align-items:center}.sample-label{font-size:10px;color:#a7b7b4;margin-bottom:5px}.sample-label>span:last-child,.sample-row>span:last-child{text-align:right}
.sample-list{overflow:auto;max-height:143px}.sample-row{margin-bottom:6px;min-height:20px}.bar-track{position:relative;height:20px;background:#1b272a}.bar-track i{height:100%;display:block;background:#33614f}.replay-changed .bar-track i{background:#665233}.bar-track b{position:absolute;left:6px;top:1px;font-size:12px;font-weight:500}.no-samples{color:#768b84;text-align:center;padding-top:22px;font-size:13px}
.replay-footnote{font-size:10px;color:#a7b7b4;line-height:1.5;border-top:1px solid #354548;padding-top:8px;margin-top:9px}
.replay-downloads{display:flex;gap:18px;margin-top:7px;font-size:11px;align-items:center}.replay-downloads a{color:#84d9b7;text-decoration:underline}.replay-downloads span{margin-left:auto;color:#768b84;font-size:10px}
</style>
