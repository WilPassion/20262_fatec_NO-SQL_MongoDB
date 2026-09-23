use inventario

show collections

db.equipamento.find()
db.software.find()
db.empresa.find()

db.software.updateMany({}, {$rename: {"sop_execucao" : "sop_execução"}})

// a. Mostre a razão social e os fones de cada fabricante de software: 
// Nome-Software–Versão–Razão Social–Fone

db.software.find()

db.software.aggregate([
    {
        $match: { "fabricante": { $exists: true } }
    },
    {
        $lookup: {
            from: "empresa", 
            localField: "fabricante", 
            foreignField: "cnpj", 
            as: "fabricante_software"
        }
    },
    {
        $project: {
            _id: 0,
            nome: 1,
            versão: 1,
            "fabricante_software.razão_social": 1,
            "fabricante_software.fones": 1
        }
    }
]);

// b.Crie uma coleção para departamento. Insira 2 documentos. 

db.departamento.insertMany([
    {
        id: 1,
        nome: "Customer Service", 
        ramal: 4502,
        responsavel: 'Raphael Lobo'
    },
    {
        id: 2, 
        nome: 'Recursos Humanos',
        diretoria: 'Executiva',
        codigo_banco: 341
    },
]);

db.departamento.find()

// c.Altere a estrutura de equipamento para referenciar os departamentos
// em que o computador foi alocado.
// (dois departamentos, um que já alocou e desalocou e o atual em que está alocado); 

// teste
db.equipamento.find(
    {tipo_eqpto: /comput/i}, 
    {patrimonio: 1, modelo: 1, marca: 1, tipo_eqpto: 1, depto: 1}
);

db.equipamento.updateOne( 
    {patrimonio: 2001}, 
    {
        $set: {
            depto_alocacao: [
                {
                    depto: 1,
                    dt_alocacao: ISODate("2026-01-10"), 
                    dt_retirada: ISODate("2026-09-11")
                },   
                {
                    depto: 2, 
                    dt_alocacao: ISODate("2026-09-12"), 
                    dt_retirada: null
                }
            ]
        }
    }
);

db.equipamento.find({patrimonio: 2001})

// teste
db.equipamento.find(
    {}, // Sem filtro, busca todos os equipamentos
    {
        _id: 0, // remove campo _id 
        patrimonio: 1,
        tipo_eqpto: 1,
        "depto_alocacao.dt_alocacao": 1,
        "depto_alocacao.dt_retirada": 1
    }
);

// // d.Faça uma consulta que mostre os seguintes dados do computador: 
// patrimônio, marca, processador, nome dos softwares instalados, data de instalação, versão , 
// SOs suportados desde que tenha suporte para Windows ( qualquer versão)

db.software.find()
db.equipamento.find()
db.equipamento.find({patrimonio: 2001});

// relacionando software x equipamento
db.equipamento.updateOne( 
    {patrimonio: 2001},
    {
        $set: {
            softwares_instalados: [
                {
                    softw: "WIN11", 
                    dt_instalação: ISODate("2026-05-20"), 
                    licenca: "WXY123"
                },  
                { 
                    softw: 'OFF365', 
                    dt_instalação: ISODate("2026-05-20"), 
                    licenca: 'OF1001' 
                }
            ]
        }
    }  
);

db.equipamento.find()
db.equipamento.find({patrimonio: 2001});
db.software.find();

db.equipamento.aggregate(
    {$match: {tipo_eqpto: /comput/i}},
    {$match: {"softwares_instalados": {$exists: true}}}, // verifica se existe o campo
    {$unwind: "$softwares_instalados"}, // desenrola o vetor
    {$lookup: {
           from: "software",
           localField: "softwares_instalados.softw", // pega o campo desenrolado com unwind para procurar na coleção software
           foreignField: "id",
           as: "softw_instalação" // resultado dessa consulta armazenado aqui
         }},
    //{$match: { "softw_instalação.sos_suportados": /windows/i }},
    {$unwind: "$softw_instalação"},
    {$project: {
        _id: 0, patrimonio: 1, marca: 1, 
        "características.processador" :1 ,
       "softw_instalação.nome" : 1 ,  "softw_instalação.versão" : 1 ,
       "softwares_instalados.dt_instalação" : 1
    }}
);

// e.Faça uma consulta que mostre os seguintes dados do departamento:
db.departamento.find() // nome, centro de custos 
db.equipamento.find({patrimonio: 2001})// patrimônio, tipo do processador dos computadores alocados, data de alocação.

db.equipamento.aggregate([
    
    {$match: {depto_alocacao: {$exists: true}}}, 
    {$unwind: "$depto_alocacao"},
    {$lookup: {
           from: "departamento",
           localField: "depto_alocacao.depto",
           foreignField: "id",
           as: "departamento_equipamento"
        }},
    {$match: {tipo_eqpto: /comput/i}},
    {$unwind: "$departamento_equipamento"},
    {$project: {
        _id: 0, patrimonio: 1, 
        "departamento_equipamento.nome": 1, 
        "departamento_equipamento.centro_custo": 1, 
        "características.processador": 1,
    }}
]);

// f.	 Faça uma consulta que mostre os seguintes dados do computador: 
// patrimônio do computador, marca do computador, processador, patrimônio do periférico instalado, modelo, 
// marca e características, data hora de instalação, para periféricos que não são da marca LG ou HP.

db.equipamento.find({patrimonio: 2001})// patrimônio, tipo do processador dos computadores alocados, data de alocação.

db.equipamento.aggregate([
    {$match: {"tipo_eqpto": /comput/i}},
    {$unwind: "$periferico_instalado"},
    {$lookup: {
           from: "equipamento",
           localField: "periferico_instalado.patrimonio",
           foreignField: "patrimonio",
           as: "instalacao_perifericos"
        }
    },
    {$unwind: "$instalacao_perifericos" },
    //{$match: { "instalacao_perifericos.marca": { $nin: [/hp/i, /lg/i]}}},
    {$match: {$and: [ {"instalacao_perifericos.marca": {$not: /lg/i}}, {"instalacao_perifericos.marca":{$not: /hp/i}}]}},
    {$project: {
        _id: 0, patrimonio: 1, "características.processador": 1 , "periféricos_instalados" : 1 , 
        "instalacao_perifericos.patrimonio" : 1, "instalacao_perifericos.marca" : 1,  "instalacao_perifericos.tipo_periférico" : 1, 
        "instalacao_perifericos.características" : 1
    }}
]);



/*
// ------------------------------------------
// ---------- REGISTROS TESTE
// ------------------------------------------
// 1. Criando a coleção de Departamentos (Atividade 04 - Item B)

db.departamento.insertMany([
    {
        nome: "Tecnologia da Informação",
        centro_custo: "CC-101",
        andar: 3,
        responsavel: "Ana Souza"
    },
    {
        nome: "Desenvolvimento de Software",
        orcamento_anual: 150000.00,
        lideranca: {
            gerente: "Carlos Lima",
            coordenador: "Beatriz Mendes"
        }
    }
]);

// 2. Inserindo Equipamentos, Histórico de Alocação e Periféricos (Atividade 04 - Itens C e F)
db.equipamento.insertMany([
    {
        patrimonio: 2001,
        marca: "Dell",
        tipo_eqpto: "Computador",
        processador: "Intel Core i7-12700H",
        fabricante: 456789123,
        departamentos: [
            { 
                nome: "Tecnologia da Informação", 
                status: "anterior", 
                data_alocacao: ISODate("2025-01-10T08:00:00Z"), 
                data_desalocacao: ISODate("2026-01-15T18:00:00Z") 
            },
            { 
                nome: "Desenvolvimento de Software", 
                status: "atual", 
                data_alocacao: ISODate("2026-01-16T09:00:00Z") 
            }
        ],
        softwares_instalados: [
            { id_software: "WIN11", data_instalacao: ISODate("2026-01-16T10:30:00Z") },
            { id_software: "OFF365", data_instalacao: ISODate("2026-01-16T11:00:00Z") }
        ],
        periferico_instalado: {
            patrimonio: 3001,
            modelo: "ErgoMouse MX",
            marca: "Logitech",
            caracteristicas: { tipo: "Mouse Sem Fio", dpi: 4000 },
            data_hora_instalacao: ISODate("2026-01-16T14:00:00Z")
        }
    },
    {
        patrimonio: 2002,
        marca: "Lenovo",
        tipo_eqpto: "Computador",
        processador: "AMD Ryzen 7 5800H",
        fabricante: 456789123,
        departamentos: [
            { 
                nome: "Tecnologia da Informação", 
                status: "atual", 
                data_alocacao: ISODate("2025-06-01T09:00:00Z") 
            }
        ],
        softwares_instalados: [
            { id_software: "DB2", data_instalacao: ISODate("2025-06-02T10:00:00Z") }
        ],
        periferico_instalado: {
            patrimonio: 3002,
            modelo: "UltraSharp U2722D",
            marca: "Dell",
            caracteristicas: { resolucao: "2560x1440", tamanho_pol: 27 },
            data_hora_instalacao: ISODate("2025-06-02T11:00:00Z")
        }
    }
]);

// 3. Atualizando a coleção de Softwares com Sistemas Operacionais (Atividade 04 - Item D)

db.software.insertMany([
    {
        id: "WIN11",
        nome: "Windows 11",
        versao: "11.5.2R",
        fabricante: 777555,
        tipo: "Sistema Operacional",
        sop_execução: ["Windows 11 Pro", "Windows 11 Enterprise"]
    },
    {
        id: "OFF365",
        nome: "Office 365",
        versao: "22.5.2R",
        fabricante: 777555,
        tipo: "Automação Escritório",
        sop_execução: ["Windows 10", "Windows 11", "macOS"]
    },
    {
        id: "DB2",
        nome: "IBM DB2",
        versao: "12.1.0",
        fabricante: 123456,
        tipo: "SGBD",
        sop_execução: ["Windows Server", "Linux Red Hat", "AIX"]
    }
]);
*/