use inventario

// a. Insira uma nova empresa fornecedora com razão social, tipo, cnpj, endereço (com campos para cada característica) e fone com campos para ddd e número.
db.empresa.insertOne({
    razão_social: "Comércio de Peças Alfa Ltda",
    tipo: "Fornecedor",
    cnpj: "456789123",
    endereço: {
        logradouro: "Rua das Flores",
        número: 120,
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01001000"
    },
    fones: [
        { ddd: 11, número: 32221111 }
    ]
})

// b. Após incluir o novo documento atualize o bairro da empresa.
db.empresa.updateOne(
    { razão_social: /^comércio de peças alfa/i },
    { $set: { "endereço.bairro": "Consolação" } }
)

// c. Mostre todos os dados de empresas que não estão localizadas no bairro Lapa.
db.empresa.find({
    "endereço.bairro": { $ne: "Lapa" }
})

// d. Mostre os mesmos dados de c) mas para as empresas que tenham a palavra Equipamento na razão social, mas que não se localizem em cidades com nome de santo (São, Santo, Santa).
db.empresa.find({
    razão_social: /equipamento/i,
    "endereço.cidade": { $not: /^s[ãa]o|santo|santa/i },
    "endereço.bairro": { $ne: "Lapa" }
})

// e. Insira um novo equipamento do tipo Periférico (por exemplo uma impressora, estabilizador, no-break). Relacione com fornecedor.
db.equipamento.insertOne({
    patrimônio: 1002,
    modelo: "LaserJet Pro",
    num_série: "HP789",
    fabricante: "456789123",
    tipo_eqpto: "Periférico",
    características: {
        resolução_pixels: "1200x1200",
        tamanho_pol: 0,
        tipo_perif: "Impressora"
    }
})

// f. Atualize um dos equipamentos cadastrados em aula definindo o fornecedor.
db.equipamento.updateOne(
    { patrimônio: 1000 },
    { $set: { fabricante: "456789123" } }
)

// g. Crie uma coleção software. Insira dois documentos. Relacione cada software com o fabricante respectivo, um para Microsoft e outro para a Nvidia.
db.software.insertMany([
    {
        nome: "Windows 11",
        versão: "22H2",
        fabricante_cnpj: 777555
    },
    {
        nome: "CUDA Toolkit",
        versão: "12.0",
        fabricante_cnpj: 123456
    }
])

// h. Inclua um novo campo em Software indicando o tipo do software, por exemplo, Sistema Operacional, SGBD, Editor de textos etc.
db.software.updateMany(
    {},
    { $set: { tipo: "Sistema Operacional" } }
)

// i. Inclua um novo campo em Software como um vetor dos Sistemas Operacionais em que pode ser instalado (onde roda)...
// -> Incluindo o vetor inicial com dois SOs
db.software.updateOne(
    { nome: "CUDA Toolkit" },
    { $set: { sistema_operacional: ["Windows 10", "Linux Ubuntu 19"] } }
)

// -> Insira um novo SO no vetor de um software
db.software.updateOne(
    { nome: "CUDA Toolkit" },
    { $push: { sistema_operacional: "CentOS 7" } }
)

// -> Atualize o nome ou versão deste último elemento incluído
db.software.updateOne(
    { nome: "CUDA Toolkit", sistema_operacional: "CentOS 7" },
    { $set: { "sistema_operacional.$": "RedHat 8" } }
)

// -> Em seguida exclua o primeiro elemento cadastrado deste vetor
db.software.updateOne(
    { nome: "CUDA Toolkit" },
    { $pop: { sistema_operacional: -1 } }
)

// -------------------------------------------------------------------------------------------------------------------------------------
// RESPOSTAS PROFESSOR

// Com base nos atributos do Diagrama de Classes acima, e das coleções desenvolvidas em aula de laboratório, 
// utilizando a linguagem javascript no SGBD MongoDB
// a)	Insira uma nova empresa fornecedora com razão social, tipo, cnpj, endereço (com campos para cada característica) e
// fone com campos para ddd e número.

db.empresa.find()

db.empresa.insertOne({razão_social : 'MicroTécnica Equipamentos Ltda ', cnpj: 777, tipo : 'Fornecedor',
endereço : {logradouro : 'Av. Cerro Corá', número : 455, bairro : 'Lapa', cidade : 'São Paulo'},
fones :  [{ddd: 11, numero : 51891000} , {ddd: 11, numero : 51831001}] })

db.empresa.find({razão_social: /MicroT.cnica/i})
// b)	Após incluir o novo documento atualize o bairro da empresa.

db.empresa.updateOne({razão_social: /MicroT.cnica/i}, {$set: {"endereço.bairro" : 'Alto da Lapa'}})

//c) Mostre todos os dados de empresas que não estão localizadas no bairro Lapa.

db.empresa.find()

db.empresa.find({$and: [ {endereço: {$not: /lapa/i }} , { "endereço.bairro" : {$not: /lapa/i } } ] })
//d)	Mostre os mesmos dados de c) mas para as empresas que tenham a palavra Equipamento na razão social, 
// mas que não se localizem em cidades com nome de santo (São, Santo, Santa).
db.empresa.find({$and: [ {razão_social : /equipamento/i}, 
                         {endereço: {$not: /sant/i }} ,
                         { "endereço.cidade" : {$not: /sant/i }},
                         {endereço: {$not: /s.*o/i }} ,
                         { "endereço.cidade" : {$not: /s.*o/i }} ] },
{_id : 0 , razão_social : 1 , "endereço.cidade": 1, fone: 1 , fones: 1 })

// e) Insira um novo equipamento do tipo Periférico (por exemplo uma impressora, um monitor). Relacione com fornecedor.

db.equipamento.find()

db.equipamento.insertOne ( { patrimônio : 1002 , tipo_eqpto: "Periférico",
modelo : "Flatron 27 IPS" , num_série : 78901 , 
características : { resolução: '1900x1200', tamanho_pol: 27 , 
tipo_periférico: "Monitor LCD"  } , Fornecedor: 777 } ) 

// f) Atualize um dos equipamentos cadastrados em aula definindo o fornecedor
db.equipamento.updateOne({patrimônio: 1001}, {$set : { Fornecedor: 987654 } }) 
db.equipamento.find({patrimônio: 1001} )

// g.	Crie uma coleção software. Insira dois documentos. 
// Relacione cada software com o fabricante respectivo, um para Microsoft e outro para a Nvidia

db.software.drop()

db.software.insertMany([{id:'WIN11', nome: 'Windows 11', versao: '11.5.2R', fabricante: 777555 }, 
{id:'OFF365', nome: 'Office 365', versao: '22.5.2R', fabricante: 777555 },
{id:'DB2', nome: 'IBM DB2', versao: '12.1.0', fabricante: 123456 }])

db.software.find()

// h.	Inclua um novo campo em Software indicando o tipo do software, por exemplo, Sistema Operacional, SGBD, Editor de textos etc.

db.software.find()

db.software.aggregate([ { $addFields: {tipo_softw: null}}])
db.software.updateOne({id:"WIN11"}, {$set: {tipo_softw: "Sistema Operacional"}})
db.software.updateOne({id:"OFF365"}, {$set: {tipo_softw: "Automacao Escritorio"}})
db.software.updateOne({id:"DB2"}, {$set: {tipo_softw: "SGBD"}})

// i.	Inclua um novo campo em Software como um vetor dos Sistemas Operacionais em que pode ser instalado (onde roda) , 
// por exemplo Windows 10, Windows 11, Linux Ubuntu 19, etc. Insira ao menos dois SO’s. 
// Após atualizar os softwares, inclua um novo SO no vetor de um software. 
// Atualize o nome ou versão deste último elemento incluído. 
// Em seguida exclua o primeiro elemento cadastrado deste vetor.

db.software.updateOne({id:'DB2'}, 

{$set: { sop_execucao: ['Windows 11', 'Linux Red Hat', 'AIX', 'Solaris'] } } )

db.software.updateOne({id:'OFF365'}, {$set: { sop_execucao: ['Windows 11', 'Windows Server']}})

// novo software para DB2

db.software.updateOne({id:'DB2'}, 
{$push: {"sop_execucao" : {$each: ['macOS'] }}} ) 
db.software.find({id:'DB2'})

// atualização

db.software.updateOne({id:'DB2' , "sop_execucao": 'Solaris'}, 
{$set: { "sop_execucao.$" : 'Solaris 11.4' } } ) 

// exclusão do 1º elemento do vetor 
db.software.updateOne({id:'DB2'}, 
{$pull: { "sop_execucao" : 'Windows 11' } } ) 

// =================================================================
// UNIFICAÇÃO DE EXERCÍCIOS (PADRÃO NUMÉRICO + SEM DROP)
// =================================================================

use inventario;

// -----------------------------------------------------------------
// 1. EMPRESAS (Fornecedores e Fabricantes)
// -----------------------------------------------------------------

// Empresa 1
db.empresa.insertOne({
    razão_social: "Comércio de Peças Alfa Ltda",
    tipo: "Fornecedor",
    cnpj: 456789123,
    endereço: {
        logradouro: "Rua das Flores",
        número: 120,
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01001000"
    },
    fones: [
        { ddd: 11, número: 32221111 }
    ]
});

// Empresa 2 (MicroTécnica - do professor)
db.empresa.insertOne({
    razão_social: "MicroTécnica Equipamentos Ltda",
    tipo: "Fornecedor",
    cnpj: 777,
    endereço: {
        logradouro: "Av. Cerro Corá",
        número: 455,
        bairro: "Lapa",
        cidade: "São Paulo"
    },
    fones: [
        { ddd: 11, número: 51891000 }, 
        { ddd: 11, número: 51831001 }
    ]
});

// Atualizando o bairro da MicroTécnica
db.empresa.updateOne(
    { razão_social: /MicroT.cnica/i },
    { $set: { "endereço.bairro": "Alto da Lapa" } }
);


// -----------------------------------------------------------------
// 2. EQUIPAMENTOS
// -----------------------------------------------------------------

// Equipamento 1 (Relacionado ao fornecedor 456789123)
db.equipamento.insertOne({
    patrimônio: 1002,
    modelo: "LaserJet Pro",
    num_série: "HP789",
    fabricante: 456789123,
    tipo_eqpto: "Periférico",
    características: {
        resolução_pixels: "1200x1200",
        tamanho_pol: 0,
        tipo_perif: "Impressora"
    }
});

// Equipamento 2 (Relacionado ao fornecedor 777)
db.equipamento.insertOne({
    patrimônio: 1003,
    tipo_eqpto: "Periférico",
    modelo: "Flatron 27 IPS",
    num_série: 78901,
    características: {
        resolução: "1900x1200",
        tamanho_pol: 27,
        tipo_periférico: "Monitor LCD"
    },
    fabricante: 777
});


// -----------------------------------------------------------------
// 3. SOFTWARES (Preservando a integridade sem o drop())
// -----------------------------------------------------------------

db.software.insertMany([
    {
        id: "WIN11",
        nome: "Windows 11",
        versão: "11.5.2R",
        fabricante: 777555,
        tipo: "Sistema Operacional"
    },
    {
        id: "OFF365",
        nome: "Office 365",
        versão: "22.5.2R",
        fabricante: 777555,
        tipo: "Automação Escritório"
    },
    {
        id: "DB2",
        nome: "IBM DB2",
        versão: "12.1.0",
        fabricante: 123456,
        tipo: "SGBD",
        sop_execucao: ["Windows 11", "Linux Red Hat", "AIX", "Solaris"]
    }
]);

// Manipulação do vetor de sistemas operacionais no DB2
db.software.updateOne(
    { id: "DB2" },
    { $push: { sop_execucao: { $each: ["macOS"] } } }
);

db.software.updateOne(
    { id: "DB2", sop_execucao: "Solaris" },
    { $set: { "sop_execucao.$": "Solaris 11.4" } }
);

db.software.updateOne(
    { id: "DB2" },
    { $pull: { sop_execucao: "Windows 11" } }
);