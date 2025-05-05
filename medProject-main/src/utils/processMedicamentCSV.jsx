export const processMedicamentCSVFile = (csvFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n');
        const boxes = []; // This will be our array of Box structs

        // First pass: collect all boxIds and their medicamentIds
        const boxMappings = {};
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [medicamentId, boxId] = line.split(',').map(item => item.trim());
          
          if (!boxId || !medicamentId) continue;
          
          if (!boxMappings[boxId]) {
            boxMappings[boxId] = [];
          }
          boxMappings[boxId].push(medicamentId);
        }

        // Convert the mappings into the required struct format
        for (const boxId in boxMappings) {
          boxes.push({
            boxId: boxId,
            medicamentIds: boxMappings[boxId]
          });
        }

        resolve(boxes);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(csvFile);
  });
};