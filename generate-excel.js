import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const products = [
  {
    'name': '纯棉舒适T恤',
    'category': 'clothing',
    'brand': '优衣库',
    'material': '纯棉',
    'size': 'L',
    'color': '白色',
    'targetAudience': 'men,women',
    'imageUrl': ''
  },
  {
    'name': '运动休闲鞋',
    'category': 'shoes',
    'brand': '耐克',
    'material': '网面',
    'size': '42',
    'color': '黑色',
    'targetAudience': 'men',
    'imageUrl': ''
  },
  {
    'name': '时尚双肩包',
    'category': 'bags',
    'brand': '新秀丽',
    'material': '尼龙',
    'size': '中号',
    'color': '灰色',
    'targetAudience': 'general',
    'imageUrl': ''
  },
  {
    'name': '简约手表',
    'category': 'accessories',
    'brand': '卡西欧',
    'material': '不锈钢',
    'size': '标准',
    'color': '银色',
    'targetAudience': 'general',
    'imageUrl': ''
  },
  {
    'name': '舒适靠枕',
    'category': 'home',
    'brand': '宜家',
    'material': '记忆棉',
    'size': '45x45cm',
    'color': '米色',
    'targetAudience': 'general',
    'imageUrl': ''
  },
  {
    'name': '无线蓝牙耳机',
    'category': 'digital',
    'brand': '索尼',
    'material': '塑料',
    'size': '标准',
    'color': '黑色',
    'targetAudience': 'general',
    'imageUrl': ''
  },
  {
    'name': '保湿面霜',
    'category': 'beauty',
    'brand': '兰蔻',
    'material': '乳液',
    'size': '50ml',
    'color': '白色',
    'targetAudience': 'women',
    'imageUrl': ''
  },
  {
    'name': '有机燕麦片',
    'category': 'food',
    'brand': '桂格',
    'material': '谷物',
    'size': '500g',
    'color': '棕色',
    'targetAudience': 'general',
    'imageUrl': ''
  },
  {
    'name': '瑜伽垫',
    'category': 'sports',
    'brand': '迪卡侬',
    'material': 'TPE',
    'size': '183x61cm',
    'color': '紫色',
    'targetAudience': 'women,men',
    'imageUrl': ''
  },
  {
    'name': '儿童玩具车',
    'category': 'baby',
    'brand': '乐高',
    'material': '塑料',
    'size': '中号',
    'color': '红色',
    'targetAudience': 'children',
    'imageUrl': ''
  }
];

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '商品信息');

const outputPath = join(__dirname, 'test_products.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('Excel文件生成成功！');
console.log('文件路径:', outputPath);
console.log('包含', products.length, '个商品数据');
