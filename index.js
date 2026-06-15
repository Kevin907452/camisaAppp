require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const Usuario = require('./esquemaUsuario');
const Camiseta = require('./esquemaCamiseta');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_2027';

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/uploads', express.static('uploads'));

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token no enviado.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    req.usuarioNombre = decoded.nombre;
    req.usuarioEmail = decoded.email;
    next();
  } catch {
    return res.status(403).json({ mensaje: 'Sesión expirada o inválida.' });
  }
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camisaApp')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.get('/api/estadisticas', async (req, res) => {
  try {
    const totalDisenos = await Camiseta.countDocuments();
    const totalUsuarios = await Usuario.countDocuments();
    const camisetas = await Camiseta.find();
    let totalVotos = 0, sumaCalif = 0;
    camisetas.forEach(c => {
      totalVotos += c.votos.length;
      sumaCalif += c.calificacion || 0;
    });
    const promedio = camisetas.length ? (sumaCalif / camisetas.length).toFixed(1) : 0;
    res.json({ totalDisenos, totalUsuarios, totalVotos, promedioGeneral: promedio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas.' });
  }
});

// Registro
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body;
    if (!nombre || !email || !clave) return res.status(400).json({ mensaje: 'Faltan datos.' });
    if (clave.length < 4) return res.status(400).json({ mensaje: 'Contraseña mínima 4 caracteres.' });
    const existente = await Usuario.findOne({ email });
    if (existente) return res.status(400).json({ mensaje: 'Email ya registrado.' });
    const hash = await bcrypt.hash(clave, 10);
    const nuevo = new Usuario({ nombre, email, clave: hash });
    await nuevo.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, clave } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    const ok = await bcrypt.compare(clave, usuario.clave);
    if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    const token = jwt.sign({ id: usuario._id, nombre: usuario.nombre, email: usuario.email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ mensaje: 'Login correcto', token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al login.' });
  }
});

app.get('/api/me', verificarToken, async (req, res) => {
  try {
    const user = await Usuario.findById(req.usuarioId).select('-clave');
    res.json(user);
  } catch {
    res.status(500).json({ mensaje: 'Error' });
  }
});

// Avatar
app.post('/api/avatar', verificarToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió imagen.' });
    const usuario = await Usuario.findById(req.usuarioId);
    if (usuario.avatar && fs.existsSync(`uploads/${usuario.avatar}`)) fs.unlinkSync(`uploads/${usuario.avatar}`);
    usuario.avatar = req.file.filename;
    await usuario.save();
    res.json({ mensaje: 'Avatar actualizado', avatar: usuario.avatar });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir avatar.' });
  }
});

// CREAR diseño (POST)
app.post('/api/camisetas', verificarToken, async (req, res) => {
  try {
    const { 
      nombreDiseno, descripcion,
      torsoColor, mangaIzquierdaColor, mangaDerechaColor, cuelloColor,
      bordeMangaIzquierdaColor, bordeMangaDerechaColor,
      bolsilloColor, textoDBColor, solapaIzquierdaColor, solapaDerechaColor
    } = req.body;
    
    if (!nombreDiseno) return res.status(400).json({ mensaje: 'Nombre obligatorio.' });
    
    const nueva = new Camiseta({
      nombreDiseno,
      autor: req.usuarioNombre,
      creador: req.usuarioId,
      descripcion: descripcion || '',
      torsoColor: torsoColor || '#E8E3D6',
      mangaIzquierdaColor: mangaIzquierdaColor || '#E8E3D6',
      mangaDerechaColor: mangaDerechaColor || '#E8E3D6',
      cuelloColor: cuelloColor || '#D7D0C3',
      bordeMangaIzquierdaColor: bordeMangaIzquierdaColor || '#3F5D44',
      bordeMangaDerechaColor: bordeMangaDerechaColor || '#3F5D44',
      bolsilloColor: bolsilloColor || '#E8E3D6',
      textoDBColor: textoDBColor || '#2B2E2C',
      solapaIzquierdaColor: solapaIzquierdaColor || '#E8E3D6',
      solapaDerechaColor: solapaDerechaColor || '#E8E3D6'
    });
    
    await nueva.save();
    res.status(201).json({ mensaje: 'Diseño guardado', camiseta: nueva });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al guardar.' });
  }
});

// OBTENER todos los diseños
app.get('/api/camisetas', async (req, res) => {
  try {
    const camisetas = await Camiseta.find().populate('creador', 'nombre email').sort({ createdAt: -1 });
    res.json(camisetas);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener.' });
  }
});

// OBTENER un diseño
app.get('/api/camisetas/:id', async (req, res) => {
  try {
    const c = await Camiseta.findById(req.params.id).populate('creador', 'nombre email');
    if (!c) return res.status(404).json({ mensaje: 'No existe.' });
    res.json(c);
  } catch {
    res.status(500).json({ mensaje: 'Error.' });
  }
});

// ACTUALIZAR diseño (PUT) - ACTUALIZACIÓN COMPLETA Y DIRECTA
app.put('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camiseta = await Camiseta.findById(req.params.id);
    if (!camiseta) return res.status(404).json({ mensaje: 'No existe.' });
    if (camiseta.creador.toString() !== req.usuarioId) 
      return res.status(403).json({ mensaje: 'No eres el creador.' });
    
    // Actualizar todos los campos permitidos (incluyendo colores)
    const camposPermitidos = [
      'nombreDiseno', 'descripcion',
      'torsoColor', 'mangaIzquierdaColor', 'mangaDerechaColor', 'cuelloColor',
      'bordeMangaIzquierdaColor', 'bordeMangaDerechaColor',
      'bolsilloColor', 'textoDBColor', 'solapaIzquierdaColor', 'solapaDerechaColor'
    ];
    
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        camiseta[campo] = req.body[campo];
      }
    });
    
    camiseta.actualizadoEn = Date.now();
    await camiseta.save();
    
    res.json({ mensaje: 'Diseño actualizado correctamente', camiseta });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al actualizar.' });
  }
});

// ELIMINAR diseño
app.delete('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camiseta = await Camiseta.findById(req.params.id);
    if (!camiseta) return res.status(404).json({ mensaje: 'No existe.' });
    if (camiseta.creador.toString() !== req.usuarioId) return res.status(403).json({ mensaje: 'No eres el creador.' });
    await Camiseta.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminada' });
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar.' });
  }
});

// VOTAR
app.post('/api/camisetas/:id/votar', verificarToken, async (req, res) => {
  try {
    const valor = Number(req.body.valor);
    if (isNaN(valor) || valor < 1 || valor > 5) return res.status(400).json({ mensaje: 'Voto inválido.' });
    const camiseta = await Camiseta.findById(req.params.id);
    if (!camiseta) return res.status(404).json({ mensaje: 'No existe.' });
    if (camiseta.votos.some(v => v.usuario.toString() === req.usuarioId)) return res.status(400).json({ mensaje: 'Ya votaste.' });
    camiseta.votos.push({ usuario: req.usuarioId, valor });
    camiseta.calcularCalificacion();
    await camiseta.save();
    res.json({ mensaje: 'Voto registrado', calificacion: camiseta.calificacion, totalVotos: camiseta.votos.length });
  } catch {
    res.status(500).json({ mensaje: 'Error al votar.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});