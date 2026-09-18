// criar db inventario
use inventario

// criar coleção empresa
db.empresa.insertOne({
    razão_social: "Nvidia Corporation do Brasil", 
    endereço: "Av. das Nações Unidas, 10000 - Santo Amaro - São Paulo", 
    tipo: "Fabricante", 
    cnpj: "123456 ", 
    fones: [1150657000, 1150668000], 
    ano_fundação : 1975
});  

// mostrar db
show dbs

// mostrar collections 
show collections

// consulta coleção - empresa
db.empresa.find()

// inserindo mais de uma empresa
db.empresa.insertMany([
   {
       razão_social: "Microsof do Brasil Ltda", 
       tipo: "Fabricante", 
       endereço: {
           logradouro: "Av. Berrini", 
           número: 1000, 
           bairro: "Broklin", 
           cidade: "São Paulo", 
           cep:  "05000300" 
       },
       fones: [{ddd:11, número: 30407089}, {ddd:11, número: 30409010}]
   },
   {
       razão_social: "Tancredo Equipamentos de Informática", 
       fones: [1132007000, 1132008000], 
       tipo: "Fornecedor", 
       cnpj: 987654, 
       ano_fundação: 2009
   }
]);

db.empresa.find({ razão_social: /^harry.*/i })

////////////////////////////////////////////////////////////////////////////////////
// inserindo registro TESTE
db.empresa.insertMany([
    {
        razão_social: "Shopee", 
        fones: [11989670074, 1132008000], 
        endereço: "Rua Vergueiro, 15530 - Paraído - São Paulo/ SP", 
        tipo: "Fornecedor", 
        cnpj: 32323232, 
        ano_fundação: 1950
    },
    {
        razão_social: "Harry Potter", 
        fones: [11989670074, 1132008000], 
        tipo: "Fornecedor", 
        cnpj: 32323232, 
        ano_fundação: 1950,
        endereço: [
                {
                    logradouro: "Rua Avenida Brasil",
                    número: 13,
                    bairro: "Vila Guarajara",
                    cidade: "Rio de Janeiro",
                    cep: "000333", 
                    país: "Brasil"
                },
                {
                    logradouro: "SW1A",
                    número: "1AA",
                    bairro: "Buckingham Palace",
                    cidade: "Londres",
                    país: "Reino Unido"
                }
            ],
    }
]);
db.empresa.deleteOne({})

////////////////////////////////////////////////////////////////////////////////////

// aula 31/agosto - Manipulação de vetores, consultas com Regex, relacionamentos

// corrigir o nome da Microsoft
db.empresa.find({razão_social: /microsof/i});  //LIKE '%microsof%' -> encontra o 
// texto mesmo que ele esteja no meio de uma frase | "i" quebra sensitive case
db.empresa.updateMany({razão_social: /microsof/i},
{$set: {razão_social: "Microsoft Corporation do Brasil Ltda"}});

/////////////////////////////////////////////////////////////////

// excluindo os documentos em duplicidade
db.empresa.deleteOne({_id: ObjectId ("6aa32f0cc1843cde6440e22d")});
db.empresa.deleteOne({_id: ObjectId ("6aa4912f8edd559836300940")});

//////////////////////////////////////////////////////////////////

// atualizando cnpj e ano fundação da Microsoft - regex na busca
db.empresa.updateOne({razão_social: /^microsoft/i}, 
{$set: { cnpj: 777555}, ano_fundação: 1975});

// atualizando ano fundação nas "Nvidias"
db.empresa.find({razão_social: /^nvidia/i});
db.empresa.updateOne({razão_social: /^nvidia/i}, {$set: {ano_fundação: 1995}});

db.empresa.findOne({razão_social: /^tancredo/i});
db.empresa.updateOne({razão_social: /^tancredo/i}, {$set: {ano_fundação: 2025}});

//////////////////////////////////////////////////////////////////
db.empresa.find().pretty() // --> consulta todos registros
// consultas com operadores numéricos:  
// $gt greater than ; $gte greater than or equal

// empresas fundadas no século passado - sec 20
// empresas fundadas em 2000 ou após
db.empresa.find({ano_fundação: {$lte: 2000 }}) // -----> // $lte lower than or equal
db.empresa.find({ano_fundação: {$gte: 2000}}) // -----> // $gte greater than or equal

// empresas fundadas em 1975
db.empresa.find({ano_fundação: {$eq: 1975}})
db.empresa.find( { ano_fundação : 1975 })   // equivale ao igual
db.empresa.find( { ano_fundação : {$ne: 1975}})  // not equal - diferente de 1975

// empresas que tem Brasil na razão social e fundadas século passado
// * As barras / ... /: Delimitam onde a expressão regular começa e termina.
// * bra: O texto deve conter obrigatoriamente essas três letras no começo da busca.
// *  .* significam: "pode ter qualquer coisa aqui no meio (ou até nada)". É por isso que ele aceita tanto "Brasil" (com s) quanto "Brazil" (com z).
// *  /i significa ignore case sensive. Então pode ser "BRASIL", "brasil", "Brasil"...
db.empresa.find({razão_social: /bra.*il/i, ano_fundação: {$lte: 2000}}) 

// * Consulta com $and considera o array e ambos objetos neles deverão ser verdadeiros
db.empresa.find({$and: [{razão_social: /bra.*il/i, ano_fundação: {$lte: 2000}}]})


// Consulta com com "Nações" no endereço e fundadas no século 20
db.empresa.find({
    endereço: /na.*es/i, 
    ano_fundação: { $lte: 2000 }
})

db.empresa.find({
    $and: [
        {endereço: /na.*es/i },
        {ano_fundação: { $lte: 2000}}
    ]
});

// empresas com endereço na cidade de São Paulo e são Fabricantes
db.empresa.find({
    $and: [
        {endereço: /s.*aulo/i}, 
        {tipo: /fabrica/i}
    ]
})

db.empresa.find({
    $and: [
        { tipo: /fabrica/i },
        {
            $or: [
                { endereço: /s.*o paulo/i },
                {"endereço.cidade": /s.*o paulo/i}   // tenta achar o termo caso o endereço tenha sido cadastrado como um objeto aninhado contendo o subcampo cidade (ex: endereço: { cidade: "São Paulo" }).
            ]
        }
    ]
});

// empresas que tem endereço na cidade de São Paulo e NÃO são Fabricantes
db.empresa.find({
    $and: [
        {tipo: {$not: /^fabrica.*/i}}, 
        {
            $or: [
                {endereço: /s.*paulo/i}, 
                {"endereço.cidade": /s.*paulo/i}
            ]
        }
    ]
})

// Manipulação Vetores
// adicionar um novo fone para a NVidia   [ 1150657000, 1150668000 ]
db.empresa.updateOne( {razão_social: /nvidia/i } , {$set: {"fones" : [11992327036] } } )
db.empresa.find( {razão_social: /nvidia/i })
db.empresa.find( {fones: 11992327036 })

// incluindo novo número no vetor
db.empresa.updateOne( {razão_social: /nvidia/i } , {$push: {"fones" : {$each :  [1150659999] } } } ) 

// atualizar um fone da Nvidia - 1150668000 => 1150663333
db.empresa.updateOne( {razão_social: /nvidia/i , "fones" : 1150668000 } , {$set: {"fones.$" : 1150663333 } } ) 

// excluir um número de fone --> 1150657000 

db.empresa.find({razão_social: /nvidia/i})
db.empresa.updateOne(
    {razão_social: /nvidia/i},
    {
        $pull: {
            "fones": 1150657000
        } 
            
    }
);

// nova coleção de equipamento --> relacionamento fabricante x fornecedor se dá pelo cnpj
db.equipamento.insertOne( 
    {
        patrimônio: 1001, 
        modelo: 'Ultra Vision Plus', 
        num_série: 'LG456', fabricante:  123456,  
        tipo_eqpto: 'Periférico',
        características: {
            resolução_pixels: '1080x720', 
            tamanho_pol: 27 ,
            tipo_perif : 'Monitor LCD'
        } 
    }  
);

// RELACIONAR os equipamentos com seus fabricantes
// similar ao JOIN do SQL -> aggregate + $lookup

db.equipamento.aggregate([
    { 
        $lookup: {
            from: "empresa",                  // Nome da coleção (tabela) externa onde os dados serão buscados
            localField: "fabricante",         // Campo da coleção atual ("equipamento") que guarda a chave de referência
            foreignField: "cnpj",             // Campo correspondente na coleção externa ("empresa") que serve como chave primária/identificador
            as: "fabricante_eqpto"            // Nome do novo array que trará os dados da empresa mesclados no resultado
        } 
    }
]);

// corrigindo o cnpj 123456 que está como string
db.empresa.updateMany(
    {cnpj: "123456 "}, 
    {
        $set: {
            cnpj: 123456
        }
    }
);

// executar a mesma consulta mas agregando no fabricante
// quais equipamentos cada fabricante "fabricou"

db.empresa.aggregate([
    {
        $lookup: {
            from: "equipamento",
            localField: "cnpj",
            foreignField: "fabricante",
            as: "eqptos_fabricados"
        }
    }
]);

// Filtro: somente para empresas fabricantes
db.empresa.aggregate([
    {
        $match: {
            tipo: /fabr/i
        }
    },
    {
        $lookup: {
            from: "equipamento",
            localField: "cnpj",
            foreignField: "fabricante",
            as: "eqptos_fabricados"
        }
    }
]);

// ----------------------------- NOTAS: ----------------------------
// -----------------------------------------------------------------
// Inserindo um novo endereço na empresa Harry Potter
// Nota: O modificador $each exige obrigatoriamente um array ([]) 
// como argumento, mesmo quando estamos inserindo apenas um único registro.
// -----------------------------------------------------------------

db.empresa.find({ razão_social: /^harry.*/i })

db.empresa.updateOne(
        { razão_social: /^harry.*/i },
        { 
            $push: {
                "endereço": {
                                                // $each exige [] como argumento, mesmo que seja apenas um registro
                    $each: [
                        {
                            logradouro: "Rua das Ilusões",
                            número: 55,
                            bairro: "Vila das Monções",
                            cidade: "Goiânia",
                            cep: "5555555",
                            país: "Brasil"
                        }    
                    ]
                }
            }
        }
);

// -----------------------------------------------------------------
// RESUMO RÁPIDO:

// $set -> Substitui e apaga todo o conteúdo anterior do campo (sobrescreve o array inteiro).
// $each -> Usado junto com o $push para adicionar novos itens a um array sem perder os antigos.
// *Exige obrigatoriamente colchetes ([])*, mesmo para apenas um item.