import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split('.')[1];

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = 'icode-' + file.originalname.split('.')[0];

    // Indica o novo nome do arquivo:
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
  },
});

const upload = multer({ storage });

async function listFiles(path, files) {
  if (!files) files = [];

  let listPath = await fs.readdir(path);
  for (let k in listPath) {
    let stat = await fs.stat(path + '/' + listPath[k]);
    if (stat.isDirectory())
      await listarArquivosDoDiretorio(path + '/' + listPath[k], files);
    else files.push(path + '/' + listPath[k]);
  }

  return files;
}

app.post('/image', upload.single('file'), (req, res) => {
  const file = req.file;
  if (file !== undefined) {
    return res.status(200).send({
      error: false,
      message: 'File uploaded successfully',
    });
  } else {
    return res.status(400).send({
      error: true,
      message: 'File cannot be accepted',
    });
  }
});

app.get('/image', async (req, res) => {
  let containerFiles = [];
  let files = await listFiles('./public/uploads'); // coloque o caminho do seu diretorio
  files.forEach((value) => {
    containerFiles.push(value.replace('./', ''));
  });
  return res.status(200).send(containerFiles);
});

app.listen(PORT, () => {
  console.log('Server is running! http://localhost:' + PORT);
});
