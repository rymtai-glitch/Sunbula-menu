const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_ANON_KEY;
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED = (process.env.TELEGRAM_ALLOWED_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

const CATS = [
  { id: 'breakfast', name: '🍳 Завтраки', items: [[1,'Английский завтрак'],[2,'Скрэмбл с семгой'],[3,'Вафли с семгой'],[4,'Сытный завтрак'],[5,'Шакшука']] },
  { id: 'porridge', name: '🥣 Каши', items: [[6,'Овсяная с вишней'],[7,'Рисовая с ягодами']] },
  { id: 'sweet', name: '🧇 Сладкие завтраки', items: [[8,'Вафли с мороженым'],[9,'Панкейки'],[10,'Сырники']] },
  { id: 'salads', name: '🥗 Салаты', items: [[11,'Цезарь с цыпленком'],[12,'Свежий салат'],[13,'Зелёный с семгой']] },
  { id: 'bowls', name: '🍲 Боулы', items: [[14,'Боул с грудкой'],[15,'Боул с семгой']] },
  { id: 'snacks', name: '🥪 Перекусы', items: [[16,'Сэндвич с индейкой'],[17,'Сэндвич с семгой'],[18,'Тост с индейкой']] },
  { id: 'main', name: '🍽 Горячее', items: [[19,'Шницель'],[20,'Говяжьи рёбрышки'],[21,'Курица в сливочном'],[22,'Судак'],[23,'Имбирный цыплёнок'],[24,'Томлёное мясо'],[25,'Куриные котлеты']] },
  { id: 'pasta', name: '🍝 Паста', items: [[26,'Арабьята'],[27,'Феттучини с курицей']] },
  { id: 'pizza', name: '🍕 Пиццы', items: [[76,'Сырная пицца'],[28,'Пепперони'],[29,'Грибная с трюфелем'],[30,'Лосось Крем Чиз'],[31,'Терияки Чикен']] },
  { id: 'soups', name: '🍜 Супы', items: [[32,'Рамен с индейкой'],[33,'Куриная лапша'],[34,'Чечевичный крем-суп'],[35,'Финский суп'],[36,'Грибной крем-суп']] },
  { id: 'coffee', name: '☕ Кофе', items: [[37,'Эспрессо'],[38,'Американо'],[39,'Латте'],[40,'Капучино'],[41,'Флэт-Уайт'],[42,'Раф'],[43,'Матча-латте'],[44,'Какао'],[45,'Горячий шоколад'],[46,'Эспрессо-тоник'],[47,'Мокко']] },
  { id: 'filter', name: '🫗 Фильтр кофе', items: [[48,'Батч-брю'],[49,'Колд-брю'],[50,'Колд-брю малина'],[51,'V-60 / Origami']] },
  { id: 'signature', name: '🍵 Авторские напитки', items: [[52,'Нитро-классик'],[53,'Нитро-апельсин'],[55,'Айс-латте Крем-брюлле'],[57,'Матча-манго'],[58,'Матча с малиной'],[60,'Матча бамбл'],[61,'Кофе бамбл'],[62,'Матча-банан']] },
  { id: 'tea', name: '🫖 Авторские чаи', items: [[63,'Чёрный чай'],[64,'Зелёный чай'],[65,'Жасмин-цитрус'],[66,'Дары Иссык-Куля'],[67,'Чабрец-малина'],[68,'Персик-лайм'],[69,'Облепиха-апельсин'],[70,'Тары-чай'],[71,'Груша-улун']] },
  { id: 'lemonade', name: '🍋 Лимонады', items: [[72,'Персик-Ваниль'],[73,'Малина-маракуйя'],[74,'Экзотик'],[75,'Груша-ананас']] },
];

async function tg(method, body) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function getStopSet() {
  const r = await fetch(`${SB_URL}/rest/v1/menu_stop_list?select=menu_id`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  const rows = await r.json();
  return new Set((Array.isArray(rows) ? rows : []).map(r => Number(r.menu_id)));
}

async function toggleItem(menuId) {
  const stopped = await getStopSet();
  if (stopped.has(menuId)) {
    await fetch(`${SB_URL}/rest/v1/menu_stop_list?menu_id=eq.${menuId}`, {
      method: 'DELETE',
      headers: { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, Prefer: 'return=minimal' },
    });
    return false;
  } else {
    await fetch(`${SB_URL}/rest/v1/menu_stop_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify({ menu_id: menuId }),
    });
    return true;
  }
}

function catsKeyboard() {
  const rows = [];
  for (let i = 0; i < CATS.length; i += 2) {
    const row = [{ text: CATS[i].name, callback_data: `c_${CATS[i].id}` }];
    if (CATS[i + 1]) row.push({ text: CATS[i + 1].name, callback_data: `c_${CATS[i + 1].id}` });
    rows.push(row);
  }
  return { inline_keyboard: rows };
}

async function itemsKeyboard(catId) {
  const cat = CATS.find(c => c.id === catId);
  if (!cat) return null;
  const stopped = await getStopSet();
  const rows = cat.items.map(([id, name]) => [{
    text: `${stopped.has(id) ? '❌' : '✅'} ${name}`,
    callback_data: `t_${id}_${catId}`,
  }]);
  rows.push([{ text: '← Назад', callback_data: 'back' }]);
  return { inline_keyboard: rows };
}

async function handleUpdate(update) {
  if (update.message) {
    const msg = update.message;
    const chatId = String(msg.chat.id);
    const text = msg.text || '';

    if (ALLOWED.length && !ALLOWED.includes(chatId)) {
      await tg('sendMessage', { chat_id: chatId, text: `Ваш ID: ${chatId}\nДоступ закрыт. Сообщите этот ID администратору.` });
      return;
    }

    const mainKeyboard = {
      keyboard: [[{ text: '🛑 Стоп лист' }]],
      resize_keyboard: true,
      persistent: true,
    };

    if (text === '/start') {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '🌿 *Sunbula — управление стоп-листом*\n\nНажмите кнопку ниже 👇',
        parse_mode: 'Markdown',
        reply_markup: mainKeyboard,
      });
    } else if (text === '🛑 Стоп лист') {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '🌿 *Sunbula — Стоп-лист*\n\nВыберите категорию:',
        parse_mode: 'Markdown',
        reply_markup: catsKeyboard(),
      });
    } else {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '🌿 Sunbula — стоп-лист\n\nНажмите кнопку ниже 👇',
        reply_markup: mainKeyboard,
      });
    }
    return;
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = String(cq.message.chat.id);
    const msgId = cq.message.message_id;
    const data = cq.data;

    if (ALLOWED.length && !ALLOWED.includes(chatId)) {
      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Нет доступа' });
      return;
    }

    await tg('answerCallbackQuery', { callback_query_id: cq.id });

    if (data === 'back') {
      await tg('editMessageText', {
        chat_id: chatId,
        message_id: msgId,
        text: '🌿 *Sunbula — Стоп-лист*\n\nВыберите категорию:',
        parse_mode: 'Markdown',
        reply_markup: catsKeyboard(),
      });
      return;
    }

    if (data.startsWith('c_')) {
      const catId = data.slice(2);
      const cat = CATS.find(c => c.id === catId);
      if (!cat) return;
      const keyboard = await itemsKeyboard(catId);
      await tg('editMessageText', {
        chat_id: chatId,
        message_id: msgId,
        text: `${cat.name}\n\n✅ в наличии  ❌ нет в наличии\nНажмите на блюдо чтобы изменить статус:`,
        reply_markup: keyboard,
      });
      return;
    }

    if (data.startsWith('t_')) {
      const parts = data.split('_');
      const itemId = Number(parts[1]);
      const catId = parts[2];
      const isStopped = await toggleItem(itemId);
      const cat = CATS.find(c => c.id === catId);
      const item = cat?.items.find(([id]) => id === itemId);
      const itemName = item ? item[1] : `#${itemId}`;
      const keyboard = await itemsKeyboard(catId);
      await tg('editMessageText', {
        chat_id: chatId,
        message_id: msgId,
        text: `${cat?.name || catId}\n\n✅ в наличии  ❌ нет в наличии\nНажмите на блюдо чтобы изменить статус:\n\n${isStopped ? '❌' : '✅'} *${itemName}* — ${isStopped ? 'добавлено в стоп-лист' : 'убрано из стоп-листа'}`,
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
      return;
    }
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await handleUpdate(req.body || {});
  } catch (e) {
    console.error('tg-bot error:', e.message);
  }
  res.status(200).end();
};
