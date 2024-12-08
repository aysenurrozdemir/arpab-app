const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ExcelJS = require('exceljs'); 
const { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType, ImageRun } = require('docx');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// DB connection
var db;
const RETRY_DELAY = 5000; // Delay between retries in milliseconds
function connect_with_timeout() {
    setTimeout(function () {
        try {
            db = mysql.createConnection({
                host: 'db',
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: 3306
            });
        } catch (err) {
            console.log(err);
        }

        db.connect(err => {
            if (err) {
                console.log(err, 'Failed to connect to database...');
                connect_with_timeout();
            } else {
                console.log('Database connected...');
            }
        });
    }, RETRY_DELAY);
}

connect_with_timeout();

///////////// EXPORT - DOWNLOAD //////////////
// Funzione per esportare il documento Word
async function exportToWord(protocollo) {
  // Percorsi dei file immagine
  const logoPath = path.join(__dirname, 'images', 'logoarpab.jpg');
  const snpaPath = path.join(__dirname, 'images', 'snpa.png');

  // Verifica l'esistenza dei file immagine
  if (!fs.existsSync(logoPath) || !fs.existsSync(snpaPath)) {
      console.error("File immagine non trovato. Assicurati che i file 'logoarpab.jpg' e 'snpa.png' siano nella directory 'images'.");
      return null;
  }

  // Crea il documento Word
  const document = new Document({
      sections: [{
          properties: {},
          children: []
      }],
  });

  const section = document.sections[0].children;

  // Query database per ottenere i risultati dalla prima tabella
  let resultsito;
  try {
      [resultsito] = await db.promise().query(
          "SELECT REPLACE(REPLACE(REPLACE(numcodsito, '[', ''), ']', ''), '\"', '') AS numcodsito_without_jolly FROM protocollocem WHERE protocollo = ?", [protocollo]);
      console.log('Query eseguita, risultati trovati:', resultsito.length);
  } catch (error) {
      console.error('Errore durante l\'esecuzione della query:', error);
      return null;
  }

  if (resultsito.length === 0) {
      console.log("Nessun dato trovato per il protocollo:", protocollo);
      return null;
  }

  // Aggiungi le immagini dell'intestazione
  section.push(new Paragraph({
      children: [
          new ImageRun({
              data: fs.readFileSync(logoPath),
              transformation: { width: 50, height: 50 },
          }),
          new ImageRun({
              data: fs.readFileSync(snpaPath),
              transformation: { width: 50, height: 50 },
          }),
      ],
  }));

  // Stile del font
  const fontStyle = new TextRun({ font: 'Times New Roman', size: 24, bold: true });
  section.push(
      new Paragraph({ text: 'Questura di Matera.', alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: '"Divisione Investigazioni Generali, Operazioni Speciali."', alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: 'I Sezione informativa', alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: 'Via Giuseppe Gattini, 12', alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: '75100 Matera', alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: 'dipps150.00L0@pecps.poliziadistato.it', alignment: AlignmentType.RIGHT })
  );

  section.push(new Paragraph({ text: '', spacing: { before: 240 } }));  // Aggiungi una riga vuota

  // Aggiungi l'oggetto
  section.push(new Paragraph({
      text: 'Oggetto: Nota prot. 132/2023 del 05/01/2023 inerente la modifica di impianti con tecnologia 5G installati a Matera ed in provincia. Riscontro',
      font: 'Times New Roman',
      size: 24,
  }));

  section.push(new Paragraph({ text: '', spacing: { before: 240 } }));  // Aggiungi una riga vuota

  // Estrai e processa i risultati
  const numcodsitoArray = [];
  resultsito.forEach(row => {
      const numcodsitoValues = row.numcodsito_without_jolly.split(',');
      numcodsitoValues.forEach(val => numcodsitoArray.push(val.trim()));
  });

  for (let numcodsito of numcodsitoArray) {
      try {
          const [result2] = await db.promise().query(
              "SELECT gestore, comune, indirizzo, numcodsito, nomesito, coordinatelong, coordinatelat FROM codicesitogestori WHERE numcodsito = ?", [numcodsito]);

          result2.forEach(row => {
              section.push(new Paragraph({
                  text: `${row.gestore} ubicata/e nel comune di ${row.comune} in via ${row.indirizzo}`,
                  font: 'Times New Roman',
                  size: 22,
              }));

              section.push(new Paragraph({
                  text: `Nome/Codice sito: ${row.nomesito} / ${row.numcodsito}`,
                  font: 'Times New Roman',
                  size: 22,
              }));

              section.push(new Paragraph({
                  text: `Dati indirizzo SITO --> Comune di: ${row.comune} sito in via ${row.indirizzo}`,
                  font: 'Times New Roman',
                  size: 22,
              }));

              section.push(new Paragraph({
                  text: `COORDINATE: latitudine: ${row.coordinatelat} longitudine: ${row.coordinatelong}`,
                  font: 'Times New Roman',
                  size: 22,
              }));

              section.push(new Paragraph({ text: '', spacing: { before: 240 } }));  // Aggiungi una riga vuota
          });
      } catch (error) {
          console.error('Errore durante l\'esecuzione della seconda query:', error);
          return null;
      }
  }

  try {
      const [result3] = await db.promise().query(
          "SELECT subassegnazione FROM protocollocem WHERE protocollo = ?", [protocollo]);

      if (result3.length > 0) {
          result3.forEach(row => {
              section.push(new Paragraph({
                  text: `Confermare Funzionario --> ${row.subassegnazione}`,
                  font: 'Times New Roman',
                  size: 22,
              }));
          });
      } else {
          section.push(new Paragraph({
              text: `Nessun risultato trovato per la subassegnazione in: ${protocollo}`,
              font: 'Times New Roman',
              size: 22,
          }));
      }
  } catch (error) {
      console.error('Errore durante l\'esecuzione della terza query:', error);
      return null;
  }

  // Dettagli del piè di pagina
  document.Footer.create({
      children: [
          new Paragraph({ text: 'Ufficio Inquinamento Acustico e Elettromagnetico', font: 'Times New Roman', size: 20, italics: true, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: 'Dirigente Responsabile Ing. Maria Angelica AULETTA', font: 'Times New Roman', size: 18, italics: true, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: 'e-mail: maria.auletta@arpab.it - Tel: 0971656218', font: 'Times New Roman', size: 18, italics: true, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: 'A.R.P.A.B. - Via della Fisica 18 C/D -  85100 Potenza (PZ)', font: 'Times New Roman', size: 18, italics: true, alignment: AlignmentType.CENTER }),
      ],
  });

  // Salva il documento
  const fileName = path.join(__dirname, 'Notadigos.docx');
  try {
      const buffer = await Packer.toBuffer(document);
      fs.writeFileSync(fileName, buffer);
      console.log('Documento Word generato:', fileName);
  } catch (error) {
      console.error('Errore durante la generazione del documento Word:', error);
      return null;
  }

  return fileName;
}


// Rotta per esportare documenti
app.post('/exportdoc/notadigos/:protocollo', async (req, res) => {
  const { protocollo } = req.params;
  const fileName = await exportToWord(protocollo);

  if (fileName && fs.existsSync(fileName)) {
      try {
          const fileData = fs.readFileSync(fileName);
          const base64File = fileData.toString('base64');

          res.json({
              fileName: path.basename(fileName),
              fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              base64Data: base64File
          });

          // Dopo che il file è stato inviato, lo rimuoviamo
          fs.unlinkSync(fileName);
      } catch (err) {
          console.error("Errore durante la lettura del file:", err);
          res.status(500).json({ error: 'Errore durante la lettura del file.' });
      }
  } else {
      console.error('File non trovato o errore nella generazione del file:', fileName);
      res.status(404).json({
          error: 'NESSUN DATO PRESENTE CON IL VALORE INSERITO',
          protocollo: protocollo
      });
  }
});

///////////// IMPORT - UPLOAD //////////////
// Configurazione multer per l'upload dei file
const upload = multer({ dest: 'uploads/' });

// Funzione per inserire i dati nel database
async function insertData(data) {
  if (data.length > 1) {
      // Rimuovi la prima riga (intestazioni)
      data.shift();

      // Filtra le righe vuote
      const nonEmptyRows = data.filter(row => {
          return Object.values(row).some(value => value !== null && value !== ''); // Verifica se almeno un campo ha un valore
      });

      if (nonEmptyRows.length === 0) {
          console.log('Nessuna riga valida da inserire');
          return;
      }

      await new Promise((resolve, reject) => {
          db.beginTransaction(async err => {
              if (err) return reject(err);

              try {
                  // Inserimento in protocollogeos
                  const insertGeos = 'INSERT INTO protocollogeos (senso, data, protocollo, autore, mittente, destinatario, oggetto) VALUES ? ON DUPLICATE KEY UPDATE protocollo = VALUES(protocollo)';
                  const valuesGeos = nonEmptyRows.map(row => [
                      row['senso'] || null,
                      row['data'] || null,
                      row['protocollo'] || null,
                      row['autore'] || null,
                      row['mittente'] || null,
                      row['destinatario'] || null,
                      row['oggetto'] || null
                  ]);

                  await new Promise((resolve, reject) => {
                      db.query(insertGeos, [valuesGeos], (err) => {
                          if (err) return reject(err);
                          resolve();
                      });
                  });

                  // Inserimento in protocollocem
                  const insertCem = `
                      INSERT INTO protocollocem (
                          senso, data, protocollo, autore, mittente, destinatario, oggetto,
                          protcollegato, elencorumore, elencoufficio, numprotcoll, riscontrogeos, riscontrouff1, riscontrouff2,
                          subassegnazione, note, tematica, categoria, sottocategoria, azione, 
                          azionedup, protriferime, aie, dpia, congiunta, simulazione, checksccem, 
                          numcodsito, numcodcar, numcodprog, statoimpianto, statoprocedura, scadenza, scadenza2, 
                          cdsdata, cdsora, notadigos, dirigente, funzionario, commriscontro
                      ) VALUES ? ON DUPLICATE KEY UPDATE
                       protocollo = VALUES(protocollo)
                  `;
                  const valuesCem = nonEmptyRows.map(row => [
                      row['senso'] || null,
                      row['data'] || null,
                      row['protocollo'] || null,
                      row['autore'] || null,
                      row['mittente'] || null,
                      row['destinatario'] || null,
                      row['oggetto'] || null,
                      null, // protcollegato
                      null, // elencorumore
                      null, //elencoufficio
                      null, // numprotcoll
                      null, // riscontrogeos
                      null, // riscontrouff1
                      null, // riscontrouff2
                      null, // subassegnazione
                      null, // note
                      null, // tematica
                      null, // categoria
                      null, // sottocategoria
                      null, // numcodsito
                      null, // numcodcar
                      null, //numcodprog
                      null, // azione
                      null, // azionedup
                      null, // protriferime
                      null, // aie
                      null, // dpia
                      null, // congiunta
                      null, // simulazione
                      null, // checksccem
                      null, // statoimpianto
                      null, // statoprocedura
                      null, // scadenza
                      null, // scadenza2
                      null, // cdsdata
                      null, // cdsora
                      null, // notadigos
                      null, // funzionario
                      null, // dirigente
                      null  // commriscontro
                  ]);

                  await new Promise((resolve, reject) => {
                      db.query(insertCem, [valuesCem], (err) => {
                          if (err) return reject(err);
                          resolve();
                      });
                  });

                  // Commit della transazione
                  db.commit(err => {
                      if (err) {
                          console.error('Errore durante il commit:', err);
                          return db.rollback(() => reject(err));
                      }
                      console.log('Dati inseriti con successo in entrambe le tabelle');
                      resolve();
                  });

              } catch (error) {
                  console.error('Errore durante l\'inserimento dei dati:', error);
                  db.rollback(() => reject(error));
              }
          });
      });
  } else {
      console.log('Nessun dato da inserire');
  }
}

// Funzione per validare i nomi delle colonne
function validateColumnNames(fileColumns, expectedColumns) {
  const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
  const extraColumns = fileColumns.filter(col => !expectedColumns.includes(col));
  return {
      isValid: missingColumns.length === 0 && extraColumns.length === 0,
      missingColumns: missingColumns,
      extraColumns: extraColumns
  };
}

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      let results = [];

      const requiredColumns = ['senso', 'data', 'protocollo', 'autore', 'mittente', 'destinatario', 'oggetto'];

      if (fileExt === '.csv') {
          fs.createReadStream(filePath)
              .pipe(csv())
              .on('data', (data) => results.push(data))
              .on('end', async () => {
                  fs.unlinkSync(filePath);

                  // Verifica nomi delle colonne
                  const fileColumns = Object.keys(results[0]);
                  const { isValid, missingColumns, extraColumns } = validateColumnNames(fileColumns, requiredColumns);

                  if (!isValid) {
                      return res.status(400).json({
                          error: 'Errore nei nomi delle colonne',
                          missingColumns: missingColumns,
                          extraColumns: extraColumns
                      });
                  }

                  // Procedi con l'inserimento dei dati
                  await insertData(results);
                  res.json({ message: 'File elaborato e dati inseriti correttamente nel database' });
              });
      } else if (fileExt === '.xlsx' || fileExt === '.xls' || fileExt === '.xltx') {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const worksheet = workbook.getWorksheet(1);

          worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
              const rowData = {};
              row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                  rowData[worksheet.getRow(1).getCell(colNumber).value] = cell.value;
              });
              results.push(rowData);
          });

          fs.unlinkSync(filePath);

          // Verifica nomi delle colonne
          const fileColumns = Object.keys(results[0]);
          const { isValid, missingColumns, extraColumns } = validateColumnNames(fileColumns, requiredColumns);

          if (!isValid) {
              return res.status(400).json({
                  error: 'Errore nei nomi delle colonne',
                  missingColumns: missingColumns,
                  extraColumns: extraColumns
              });
          }

          // Procedi con l'inserimento dei dati
          await insertData(results);
          res.json({ message: 'File elaborato e dati inseriti correttamente nel database' });
      } else {
          fs.unlinkSync(filePath);
          res.status(400).json({ error: 'Tipo di file non supportato' });
      }
  } catch (error) {
      console.error('Errore durante l\'elaborazione del file o l\'inserimento dei dati:', error);
      res.status(500).json({ error: `Errore durante l'inserimento dei dati: ${error.message}` });
  }
});

/////////////////////// GENERIC POST+PUT APIs ///////////////////////
// API POST - Insert data in DB - GENERIC FORM
app.post('/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const fields = req.body.fields;
  const numcodsito = fields.numcodsito; // Codice comune

  const columns = Object.keys(fields);
  const values = Object.values(fields).map(value => {
    if (Array.isArray(value)) {
      return JSON.stringify(value); // Gestione array
    } else if (value === undefined || value === null) {
      return null; // Valori null o undefined
    } else if (typeof value === 'boolean') {
      return value ? 1 : 0; // Conversione booleani
    } else if (value instanceof Date) {
      return value.toISOString().slice(0, 19).replace('T', ' '); // Gestione date
    }
    return value; // Passa altri valori direttamente
  });

  const placeholders = columns.map(() => '?').join(', ');
  const qrInsert = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

  // Inserimento dati nella tabella protocollocem
  db.query(qrInsert, values, (err, result) => {
    if (err) {
      console.error(err, 'Errore durante la query INSERT');
      return res.status(500).send({
        message: 'Errore durante l\'inserimento dei dati',
        error: err
      });
    }

    const newProtocollo = fields.protocollo; // Recupera il valore del protocollo appena inserito

    // Aggiornamento tabella codicesitogestori con il nuovo protocollo
    if (newProtocollo && numcodsito) {
      const numcodsitoArray = Array.isArray(numcodsito) ? numcodsito : [numcodsito];

      numcodsitoArray.forEach((codsito) => {
        // Prima recupera l'attuale valore di protcoll
        const qrGetProtcoll = `
          SELECT protcoll FROM codicesitogestori WHERE numcodsito = ?
        `;
        db.query(qrGetProtcoll, [codsito], (getErr, result) => {
          if (getErr) {
            console.error(getErr, 'Errore durante il recupero di protcoll');
            return res.status(500).send({
              message: 'Errore durante il recupero di protcoll',
              error: getErr
            });
          }

          let existingProtcoll = result[0]?.protcoll || '[]'; // Usa un array vuoto se non esiste
          let updatedProtcoll;

          try {
            const existingProtocolsArray = JSON.parse(existingProtcoll);
            const mergedProtocols = new Set([...existingProtocolsArray, String(newProtocollo)]); // Assicurati che sia una stringa
            updatedProtcoll = JSON.stringify(Array.from(mergedProtocols)); // Converti di nuovo in stringa JSON
          } catch (parseErr) {
            console.error(parseErr, 'Errore nel parsing del protocollo esistente');
            return res.status(500).send({
              message: 'Errore nel parsing del protocollo esistente',
              error: parseErr
            });
          }

          // Aggiorna il campo protcoll nella tabella codicesitogestori
          const qrUpdateProtcoll = `
            UPDATE codicesitogestori 
            SET protcoll = ?
            WHERE numcodsito = ?
          `;
          db.query(qrUpdateProtcoll, [updatedProtcoll, codsito], (updateErr, updateResult) => {
            if (updateErr) {
              console.error(updateErr, 'Errore durante l\'aggiornamento del protocollo collegato per il Codice CEM');
              return res.status(500).send({
                message: 'Errore durante l\'aggiornamento del protocollo collegato per il Codice CEM',
                error: updateErr
              });
            }
          });
        });
      });

      res.send({
        message: `Dati inseriti correttamente nella tabella ${tableName} e protocollo aggiornato per tutti i valori di numcodsito`
      });
    } else {
      res.send({
        message: `Dati inseriti correttamente nella tabella ${tableName}`
      });
    }
  });
});

// API PUT - Update data in DB - GENERIC FORM
app.put('/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const idFieldName = Object.keys(req.query)[0];
  const idFieldValue = req.query[idFieldName]; // Questo potrebbe essere multiplo
  const fieldsToUpdate = req.body.fields;

  if (!idFieldName || !idFieldValue) {
    return res.status(400).send({ message: 'Il campo ID e il suo valore devono essere forniti come parametro di query' });
  }

  if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).send({ message: 'Il corpo della richiesta non contiene dati validi per l\'aggiornamento' });
  }

  const columnsToUpdate = Object.keys(fieldsToUpdate);
  const valuesToUpdate = Object.values(fieldsToUpdate).map(value => {
    if (Array.isArray(value)) {
      return JSON.stringify(value); // Gestione degli array
    } else if (value === undefined || value === null) {
      return null; // Gestione dei valori null
    } else if (typeof value === 'boolean') {
      return value ? 1 : 0; // Conversione dei booleani
    } else if (value instanceof Date) {
      return value.toISOString().slice(0, 19).replace('T', ' '); // Conversione delle date
    }
    return value; // Gli altri tipi di valori vengono passati direttamente
  });

  const placeholders = columnsToUpdate.map(column => `${column} = ?`).join(', ');

  const updateQuery = Array.isArray(idFieldValue)
    ? `UPDATE ${tableName} SET ${placeholders} WHERE ${idFieldName} IN (${idFieldValue.map(value => `'${value}'`).join(',')})`
    : `UPDATE ${tableName} SET ${placeholders} WHERE ${idFieldName} = ?`;

  const updateValues = Array.isArray(idFieldValue) ? valuesToUpdate : [...valuesToUpdate, idFieldValue];

  db.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error(err, 'Errore durante la query UPDATE');
      return res.status(500).send({
        message: 'Errore durante l\'aggiornamento dei dati',
        error: err
      });
    }

    // Aggiorna il protocollo collegato in codicesitogestori
    if (fieldsToUpdate.protocollo && fieldsToUpdate.numcodsito) {
      const newProtocollo = fieldsToUpdate.protocollo;
      const numcodsitoArray = Array.isArray(fieldsToUpdate.numcodsito)
        ? fieldsToUpdate.numcodsito
        : [fieldsToUpdate.numcodsito];

      numcodsitoArray.forEach((numcodsito) => {
        // Prima recupera l'attuale valore di protcoll
        const qrGetProtcoll = `
          SELECT protcoll FROM codicesitogestori WHERE numcodsito = ?
        `;
        db.query(qrGetProtcoll, [numcodsito], (getErr, result) => {
          if (getErr) {
            console.error(getErr, 'Errore durante il recupero di protcoll');
            return res.status(500).send({
              message: 'Errore durante il recupero di protcoll',
              error: getErr
            });
          }

          let existingProtcoll = result[0]?.protcoll || '[]'; // Usa un array vuoto se non esiste
          let updatedProtcoll;

          try {
            const existingProtocolsArray = JSON.parse(existingProtcoll);
            const mergedProtocols = new Set([...existingProtocolsArray, String(newProtocollo)]); // Assicurati che sia una stringa
            updatedProtcoll = JSON.stringify(Array.from(mergedProtocols)); // Converti di nuovo in stringa JSON
          } catch (parseErr) {
            console.error(parseErr, 'Errore nel parsing del protocollo esistente');
            return res.status(500).send({
              message: 'Errore nel parsing del protocollo esistente',
              error: parseErr
            });
          }

          // Aggiorna direttamente il campo protcoll nella tabella codicesitogestori
          const qrUpdateProtcoll = `
            UPDATE codicesitogestori 
            SET protcoll = ?
            WHERE numcodsito = ?
          `;
          db.query(qrUpdateProtcoll, [updatedProtcoll, numcodsito], (updateErr, updateResult) => {
            if (updateErr) {
              console.error(updateErr, 'Errore durante l\'aggiornamento del protocollo collegato per il Codice CEM');
              return res.status(500).send({
                message: 'Errore durante l\'aggiornamento del protocollo collegato per il Codice CEM',
                error: updateErr
              });
            }
          });
        });
      });
    }

    res.send({ message: 'Dati aggiornati correttamente' });
  });
});

////////////////////////////// PROTOCOLLO CEM //////////////////////////////////////////
// API GET all data from "protocollocem" table
app.get('/protocollocem', (req, res) => {
  let qr = `SELECT * FROM protocollocem`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      // Parse the fields that are known to be JSON strings into actual arrays
      const parsedResult = result.map(row => {
        const fieldsToParse = ['numprotcoll', 'subassegnazione', 'azione', 'protriferime', 'numcodsito', 'numcodcar', 'numcodprog'];
        
        fieldsToParse.forEach(field => {
            if (row[field]) {
                try {
                    row[field] = JSON.parse(row[field]);
                } catch (e) {
                    console.log(`Errore nel parsing del campo '${field}' per l'id ${row.idprot}:`, e);
                }
            }
        });

        return row;
      });

      res.send({
        message: 'Tutti i dati dalla tabella protocollocem',
        data: parsedResult
      });
    }
  });
});

// API GET all values of the "protocollo" column
app.get('/protocollocem/protocolli', (req, res) => {
  let qr = `SELECT protocollo FROM protocollocem`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET per i valori di "protocollo"');
      return res.status(500).send({
        message: 'Errore durante il recupero dei valori di "protocollo"',
        error: err
      });
    }
    res.send({
      message: 'Valori di "protocollo" recuperati correttamente',
      data: result
    });
  });
});

// API GET - Ottieni dati per un protocollo specifico
app.get('/protocollocem/p/*', (req, res) => {
  const protocollo = req.params[0]; // Cattura tutto dopo /p/
  let qr = 'SELECT * FROM protocollocem WHERE protocollo = ?';

  db.query(qr, [protocollo], (err, result) => {
    if (err) {
      console.error('Errore durante la query GET per protocollo:', err);
      res.status(500).json({
        message: 'Errore durante il recupero dei dati per protocollo',
        error: err
      });
    } else {
      const parsedResult = result.map(row => {
        const fieldsToParse = ['numprotcoll', 'subassegnazione', 'azione', 'protriferime', 'numcodsito', 'numcodcar', 'numcodprog'];
        fieldsToParse.forEach(field => {
          if (row[field]) {
            try {
              row[field] = JSON.parse(row[field]);
            } catch (e) {
              console.error(`Errore nel parsing del campo '${field}' per l'id ${row.idprot}:`, e);
            }
          }
        });
        return row;
      });

      res.json({
        message: 'Dati per protocollo recuperati con successo',
        data: parsedResult
      });
    }
  });
});

// API GET dei valori "subassegnazione"
app.get('/operatori', (req, res) => {
  let qr = `SELECT nomeoperatore FROM operatori`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per gli operatori',
        error: err
      });
    }
    res.send({
      message: 'operatori recuperati correttamente',
      data: result
    });
  });
});

// API GET data for "senso" dropdown
app.get('/senso', (req, res) => {
  let qr = `SELECT valore FROM senso`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per i valori di "senso"',
        error: err
      });
    }
    res.send({
      message: 'Dati "senso" recuperati correttamente',
      data: result
    });
  });
});

// API GET dei valori "tematica"
app.get('/tematiche', (req, res) => {
  let qr = `SELECT tipotematica FROM tematiche`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le tematiche',
        error: err
      });
    }
    res.send({
      message: 'Tematiche recuperate correttamente',
      data: result
    });
  });
});

// API CATEGORIE
// API GET dei valori "catcem"
app.get('/catcem', (req, res) => {
  let qr = `SELECT catcem FROM catcem`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le categorie',
        error: err
      });
    }
    res.send({
      message: 'Categorie recuperate correttamente',
      data: result
    });
  });
});

// API GET dei valori "catrum"
app.get('/catrum', (req, res) => {
  let qr = `SELECT catrum FROM catrum`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le categorie',
        error: err
      });
    }
    res.send({
      message: 'Categorie recuperate correttamente',
      data: result
    });
  });
});

// API GET dei valori "catuff"
app.get('/catuff', (req, res) => {
  let qr = `SELECT catuff FROM catuff`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le categorie',
        error: err
      });
    }
    res.send({
      message: 'Categorie recuperate correttamente',
      data: result
    });
  });
});

// API SOTTOCATEGORIE
// API GET dei valori "sottcatcem"
app.get('/sottcatcem', (req, res) => {
  let qr = `SELECT sottcatcem FROM sottcatcem`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatcem1', (req, res) => {
  let qr = `SELECT sottcatcem1 FROM sottcatcem1`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatcem2', (req, res) => {
  let qr = `SELECT sottcatcem2 FROM sottcatcem2`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatcem3', (req, res) => {
  let qr = `SELECT sottcatcem3 FROM sottcatcem3`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatcem4', (req, res) => {
  let qr = `SELECT sottcatcem4 FROM sottcatcem4`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatrum', (req, res) => {
  let qr = `SELECT sottcatrum FROM sottcatrum`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

app.get('/sottcatuff', (req, res) => {
  let qr = `SELECT sottcatuff FROM sottcatuff`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le sottocategorie',
        error: err
      });
    }
    res.send({
      message: 'Sottocategorie recuperate correttamente',
      data: result
    });
  });
});

// API GET dei valori "classifcem"
app.get('/classifcem', (req, res) => {
  let qr = `SELECT valoretemrum FROM classifcem ORDER BY valoretemrum ASC`; // ORDER BY per ordinamento
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le azioni',
        error: err
      });
    }
    res.send({
      message: 'Azioni recuperate correttamente',
      data: result
    });
  });
});

// API GET dei valori "Numero Codice Sito" SELECT
app.get('/codicesitogestori/numcodsito', (req, res) => {
  let qr = `SELECT numcodsito, gestore FROM codicesitogestori`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per numcodsito+gestore',
        error: err
      });
    }
    res.send({
      message: 'numcodsito+gestore recuperati correttamente',
      data: result
    });
  });
});

// API GET - Ottieni dati del sito tramite codice sito - view link
app.get('/codicesitogestori/n/:siteCode', (req, res) => {
  const siteCode = req.params.siteCode;
  let qr = 'SELECT * FROM codicesitogestori WHERE numcodsito = ?';

  db.query(qr, [siteCode], (err, result) => {
    if (err) {
      console.error('Errore durante la query GET:', err);
      res.status(500).json({
        message: 'Errore nel recupero dei dati del sito',
        error: err
      });
    } else if (result.length === 0) {
      res.status(404).json({
        message: 'Nessun dato trovato per il codice sito fornito'
      });
    } else {
      res.json({
        message: 'Dati del sito recuperati con successo',
        data: result // Send the result array instead of a single object
      });
    }
  });
});

// API GET dei valori "Elenco Rumore" SELECT
app.get('/elencogestorirumcem/numcodcar', (req, res) => {
  let qr = `SELECT numcodcar, gestore FROM elencogestorirumcem`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per numcodcar',
        error: err
      });
    }
    res.send({
      message: 'numcodcar recuperato correttamente',
      data: result
    });
  });
});

// API GET - Ottieni dati tramite codice car - view link
app.get('/elencogestorirumcem/n/:carCode', (req, res) => {
  const carCode = req.params.carCode;
  let qr = 'SELECT * FROM elencogestorirumcem WHERE numcodcar = ?';

  db.query(qr, [carCode], (err, result) => {
    if (err) {
      console.error('Errore durante la query GET:', err);
      res.status(500).json({
        message: 'Errore nel recupero dei dati',
        error: err
      });
    } else if (result.length === 0) {
      res.status(404).json({
        message: 'Nessun dato trovato per il codice fornito'
      });
    } else {
      res.json({
        message: 'Dati recuperati con successo',
        data: result // Send the result array instead of a single object
      });
    }
  });
});

// API GET dei valori "Elenco Ufficio" SELECT
app.get('/elencogestoriufficio/numcodprog', (req, res) => {
  let qr = `SELECT numcodprog, gestore FROM elencogestoriufficio`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per numcodprog',
        error: err
      });
    }
    res.send({
      message: 'numcodprog recuperato correttamente',
      data: result
    });
  });
});

// API GET - Ottieni dati tramite codice prog - view link
app.get('/elencogestoriufficio/n/:progCode', (req, res) => {
  const progCode = req.params.progCode;
  let qr = 'SELECT * FROM elencogestoriufficio WHERE numcodprog = ?';

  db.query(qr, [progCode], (err, result) => {
    if (err) {
      console.error('Errore durante la query GET:', err);
      res.status(500).json({
        message: 'Errore nel recupero dei dati del sito',
        error: err
      });
    } else if (result.length === 0) {
      res.status(404).json({
        message: 'Nessun dato trovato per il codice sito fornito'
      });
    } else {
      res.json({
        message: 'Dati recuperati con successo',
        data: result // Send the result array instead of a single object
      });
    }
  });
});

// API GET dei valori "statoimpianto"
app.get('/statoimpianto', (req, res) => {
  let qr = `SELECT valore FROM statoimpianto`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per gli stati impianto',
        error: err
      });
    }
    res.send({
      message: 'Stati impianto recuperati correttamente',
      data: result
    });
  });
});

// API GET dei valori "statoprocedura"
app.get('/statoprocedura', (req, res) => {
  let qr = `SELECT valore FROM statoprocedura`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per gli stati procedura',
        error: err
      });
    }
    res.send({
      message: 'Stati procedura recuperati correttamente',
      data: result
    });
  });
});

////////////////////////////// PROTOCOLLO CEM 2022 //////////////////////////////////////////
// API GET all data from "protocollocem2022" table
app.get('/protocollocem2022', (req, res) => {
  let qr = `SELECT * FROM protocollocem2022`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella protocollocem2022',
        data: result
      });
    }
  });
});

////////////////////////////// PROTOCOLLO CEM 2023 //////////////////////////////////////////
// API GET all data from "protocollocem2023" table
app.get('/protocollocem2023', (req, res) => {
  let qr = `SELECT * FROM protocollocem2023`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella protocollocem2023',
        data: result
      });
    }
  });
});

////////////////////////////// PROTOCOLLO GEOS //////////////////////////////////////////
// API GET all data from "protocollogeos" table
app.get('/protocollogeos', (req, res) => {
  let qr = `SELECT * FROM protocollogeos`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      // Format the 'data' field to 'dd-mm-yyyy'
      const formattedResult = result.map(row => {
        if (row.data) {
          const dateObj = new Date(row.data);
          const day = String(dateObj.getUTCDate()).padStart(2, '0');
          const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
          const year = dateObj.getUTCFullYear();
          row.data = `${day}-${month}-${year}`;
        }
        return row;
      });

      res.send({
        message: 'Tutti i dati dalla tabella protocollogeos',
        data: formattedResult
      });
    }
  });
});

////////////////////////////// CATASTO SITO GESTORI CEM - codicesitogestori table //////////////////////////////////////////
// API GET all data from "codicesitogestori" table
app.get('/codicesitogestoriAll', (req, res) => {
  let qr = `SELECT * FROM codicesitogestori`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      // Parse the fields that are known to be JSON strings into actual arrays
      const parsedResult = result.map(row => {
        const fieldsToParse = ['protcoll'];

        fieldsToParse.forEach(field => {
            if (row[field]) {
                try {
                    row[field] = JSON.parse(row[field]);
                } catch (e) {
                    console.log(`Errore nel parsing del campo '${field}' per l'id ${row.id}:`, e);
                }
            }
        });

        return row;
      });

      res.send({
        message: 'Tutti i dati dalla tabella codicesitogestori',
        data: parsedResult
      });
    }
  });
});

// API GET dei valori "gestori"
app.get('/gestore', (req, res) => {
  let qr = `SELECT nomegestore FROM gestori`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per i gestori',
        error: err
      });
    }
    res.send({
      message: 'Gestori recuperati correttamente',
      data: result
    });
  });
});

//// API form nidificato reg-prov-com ////
// API to GET regioni
app.get('/gi_regioni/regione', (req, res) => {
  let qr = `SELECT codice_regione AS codice, denominazione_regione AS denominazione FROM gi_regioni`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le regioni',
        error: err
      });
    }
    res.send({
      message: 'Regioni recuperate correttamente',
      data: result
    });
  });
});
// API to GET province by regione using dynamic URL parameter
app.get('/gi_province/provincia/:regione', (req, res) => {
  const regioneCodice = req.params.regione;
  let qr = `SELECT sigla_provincia AS codice, denominazione_provincia AS denominazione FROM gi_province WHERE codice_regione = ?`;
  db.query(qr, [regioneCodice], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per le province',
        error: err
      });
    }
    res.send({
      message: 'Province recuperate correttamente',
      data: result
    });
  });
});

// API to GET comuni by provincia using dynamic URL parameter
app.get('/gi_comuni/comune/:provincia', (req, res) => {
  const provinciaSigla = req.params.provincia;
  let qr = `SELECT codice_istat AS codice, denominazione_ita AS denominazione FROM gi_comuni WHERE sigla_provincia = ?`;
  db.query(qr, [provinciaSigla], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per i comuni',
        error: err
      });
    }
    res.send({
      message: 'Comuni recuperati correttamente',
      data: result
    });
  });
});
//// END API form nidificato reg-prov-com ////

////////////////////////////// SCHEDA RADIO ELETTRICA //////////////////////////////////////////
// API GET all data from "rilevazionisito" table
app.get('/rilevazionisitoAll', (req, res) => {
  let qr = `SELECT * FROM rilevazionisito`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Dati recuperati dalla tabella rilevazionisito',
        data: result
      });
    }
  });
});

// Endpoint per ottenere i dati dalla tabella rilevazionisito
app.get('/rilevazionisito/:numcodsito', (req, res) => {
  const numcodsito = req.params.numcodsito;
  const query = 'SELECT * FROM rilevazionisito WHERE numcodsito = ?';

  db.query(query, [numcodsito], (err, results) => {
    if (err) {
      console.error('Errore nell\'esecuzione della query:', err);
      res.status(500).send('Errore del server');
      return;
    }
    res.json(results);
  });
});

////////////////////////////// GESTORI CEM //////////////////////////////////////////
// API GET all data from "gestori" table
app.get('/gestoriAll', (req, res) => {
  let qr = `SELECT * FROM gestori`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella gestori',
        data: result
      });
    }
  });
});

////////////////////////////// ELENCO RUMORE/RUMORE CEM //////////////////////////////////////////
// API GET all data from "elencogestorirumcem" table
app.get('/elencogestorirumcemAll', (req, res) => {
  let qr = `SELECT * FROM elencogestorirumcem`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      // Parse the fields that are known to be JSON strings into actual arrays
      const parsedResult = result.map(row => {
        const fieldsToParse = ['protcoll', 'comune'];

        fieldsToParse.forEach(field => {
            if (row[field]) {
                try {
                    row[field] = JSON.parse(row[field]);
                } catch (e) {
                    console.log(`Errore nel parsing del campo '${field}' per l'id ${row.id}:`, e);
                }
            }
        });

        return row;
      });

      res.send({
        message: 'Tutti i dati dalla tabella elencogestorirumcem',
        data: parsedResult
      });
    }
  });
});

////////////////////////////// GESTORI RUMORE //////////////////////////////////////////
// API GET all data from "gestorirum" table
app.get('/gestorirumAll', (req, res) => {
  let qr = `SELECT * FROM gestorirum`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella gestori',
        data: result
      });
    }
  });
});

////////////////////////////// ELENCO UFFICIO //////////////////////////////////////////
// API GET all data from "elencogestoriufficio" table
app.get('/elencogestoriufficioAll', (req, res) => {
  let qr = `SELECT * FROM elencogestoriufficio`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella elencogestoriufficio',
        data: result
      });
    }
  });
});

////////////////////////////// MISURE CEM //////////////////////////////////////////
// API GET all data from "misurecemrf" table
app.get('/misurecemAll', (req, res) => {
  let qr = `SELECT * FROM misurecemrf`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      // Parse the fields that are known to be JSON strings into actual arrays
      const fieldsToParse = ['codsito', 'modstrum', 'tartstrum'];
      
      const parsedResult = result.map(row => {
        fieldsToParse.forEach(field => {
          if (row[field]) {
            try {
              row[field] = JSON.parse(row[field]);
            } catch (e) {
              console.log(`Errore nel parsing del campo '${field}' per l'id ${row.id}:`, e);
            }
          }
        });
        return row;
      });

      res.send({
        message: 'Tutti i dati dalla tabella misurecemrf',
        data: parsedResult
      });
    }
  });
});

// API GET modello+serialnumber from "strumenticem" table 
// Modello Strumento Select
app.get('/strumenticem/model', (req, res) => {
  let qr = `SELECT modello, serialnumber FROM strumenticem`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Dati recuperati dalla tabella strumenticem',
        data: result
      });
    }
  });
});

// Sonda collegata Select
app.get('/misurecemrf/sonda', (req, res) => {
  let qr = `SELECT sonda FROM misurecemrf`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Dati sonda recuperati dalla tabella misurecemrf',
        data: result
      });
    }
  });
});

// Taraturastrumento collegata Select
app.get('/misurecemrf/tartstrum', (req, res) => {
  let qr = `SELECT tartstrum FROM misurecemrf`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Dati tartstrum recuperati dalla tabella misurecemrf',
        data: result
      });
    }
  });
});

// API GET - Ottieni dati per un modello specifico
app.get('/strumenticem/m/*', (req, res) => {
  const modello = req.params[0]; // Cattura tutto dopo /m/
  const qr = 'SELECT * FROM strumenticem WHERE modello = ?';

  db.query(qr, [modello], (err, result) => {
    if (err) {
      console.error('Errore durante la query GET per modello:', err);
      res.status(500).json({
        message: 'Errore durante il recupero dei dati per modello',
        error: err
      });
    } else {
      res.json({
        message: 'Dati per modello recuperati con successo',
        data: result
      });
    }
  });
});

////////////////////////////// SONDE STRUM //////////////////////////////////////////
// API GET all data from "sondestrum" table
app.get('/sondestrumAll', (req, res) => {
  let qr = `SELECT * FROM sondestrum`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella sondestrum',
        data: result
      });
    }
  });
});
////////////////////////////// STRUMENTI CEM //////////////////////////////////////////
// API GET all data from "strumenticem" table
app.get('/strumenticemAll', (req, res) => {
  let qr = `SELECT * FROM strumenticem`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, 'Errore durante la query GET');
      res.status(500).send({
        message: 'Errore durante il recupero dei dati',
        error: err
      });
    } else {
      res.send({
        message: 'Tutti i dati dalla tabella strumenticem',
        data: result
      });
    }
  });
});

// API GET dei valori "anaarpab"
app.get('/anaarpab', (req, res) => {
  let qr = `SELECT * FROM anaarpab`; 
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante la query GET per i gestori',
        error: err
      });
    }
    res.send({
      message: 'Dati anaarpab recuperati correttamente',
      data: result
    });
  });
});

//////////////// GENERIC DELETE APIs  ///////////
// API DELETE single data for any table
app.delete('/:tableName/single', (req, res) => {
  const tableName = req.params.tableName;
  const primaryKey = req.query.primaryKey; // Assuming the primary key field name is provided as a query parameter
  const primaryKeyValue = req.query.primaryKeyValue; // Assuming the primary key value is provided as a query parameter
  if (!primaryKey || !primaryKeyValue) {
    return res.status(400).send({
      message: 'Il campo chiave primaria e il suo valore devono essere forniti come parametri di query'
    });
  }
  let qr = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;
  db.query(qr, [primaryKeyValue], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante l\'eliminazione dei dati',
        error: err
      });
    }
    res.send({
      message: 'Dati eliminati con successo'
    });
  });
});
// API DELETE - Delete multiple data for any table
app.delete('/:tableName/multiple', (req, res) => {
  const tableName = req.params.tableName;
  const primaryKey = req.query.primaryKey; // Assuming the primary key field name is provided as a query parameter
  const primaryKeyValues = req.body; // Array of primary key values to delete
  if (!primaryKey || primaryKeyValues.length === 0) {
    return res.status(400).send({
      message: 'Il campo chiave primaria e almeno un valore devono essere forniti come parametri'
    });
  }
  let qr = `DELETE FROM ${tableName} WHERE ${primaryKey} IN (?)`;
  db.query(qr, [primaryKeyValues], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        message: 'Errore durante l\'eliminazione dei dati',
        error: err
      });
    }
    res.send({
      message: 'Dati eliminati con successo'
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000...');
});
