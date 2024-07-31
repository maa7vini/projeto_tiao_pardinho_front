import styles from './Header.module.css';

import api from '../../services/api';

import React, { useEffect, useState } from 'react';

import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import { CiTrash } from "react-icons/ci";

import { IconContext } from 'react-icons';

interface Album {
    id: number,
    nome: string,
    capa_album: string,
}

interface Faixa {
    id: number,
    nome: string,
    album_id: number
}

interface ApiResponseAlbums {
    status: boolean,
    albums: Album[]
}

interface ApiResponseFaixas {
    status: boolean,
    faixas: Faixa[]
}

function Header(){

    const [albums, setAlbums] = useState<Album[]>([]);
    const [faixas, setFaixas] = useState<Faixa[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<'albums' | 'faixas'>('albums');
    const [pesquisa, setPesquisa] = useState('');
    const [mostrarFaixaModal, setMostrarFaixaModal] = useState(false);
    const [novaFaixaNome, setNovaFaixaNome] = useState('');
    const [idAlbumSelecionado, setIdAlbumSelecionado] = useState<number | null>(null);
    const [estaCriando, setEstaCriando] = useState(false);

    useEffect(() => {
        api
        .get<ApiResponseAlbums>('albums')
        .then(res => setAlbums(res.data.albums))
        .catch((err) => {
            console.log('Algo deu errado!', err)
        })
    }, [])

    useEffect(() => {
        api
        .get<ApiResponseFaixas>('faixas')
        .then(res => setFaixas(res.data.faixas))
        .catch((err) => {
            console.log('Algo deu errado!', err)
        })
    }, [])

    const pegarAlbumPorId = (album_id: number) => {
        return albums.find(album => album.id === album_id);
    }

    const handlePesquisa = (event: React.FormEvent) => {
        event.preventDefault();
    }

    const handleAddFaixa = async () => {
        if (estaCriando || idAlbumSelecionado === null) return; 

        setEstaCriando(true);
        try {
            const newTrack = { nome: novaFaixaNome, album_id: idAlbumSelecionado };
            const response = await api.post('faixas', newTrack);
            if (response.data.status) {
                const faixasResponse = await api.get<ApiResponseFaixas>('faixas');
                setFaixas(faixasResponse.data.faixas);
                setMostrarFaixaModal(false);
                setNovaFaixaNome('');
                setIdAlbumSelecionado(null);
            }
        } catch (error) {
            console.error('Erro ao adicionar faixa:', error);
        } finally {
            setEstaCriando(false);
        }
    };

    const handleDelete = async (id: number, tipo: 'album' | 'faixa') => {
        try {
            if (tipo === 'album') {
                const response = await api.delete(`albums/${id}`);
                if (response.data.status) {
                    setAlbums(albums.filter(album => album.id !== id));
                }
            } else {
                const response = await api.delete(`faixas/${id}`);
                if (response.data.status) {
                    setFaixas(faixas.filter(faixa => faixa.id !== id));
                }
            }
        } catch (error) {
            console.error(`Erro ao deletar ${tipo}:`, error);
        }
    };

    const filtroAlbums = albums.filter(album => album.nome.toLowerCase().includes(pesquisa.toLowerCase()));
    const filtroFaixas = faixas.filter(faixa => faixa.nome.toLowerCase().includes(pesquisa.toLowerCase()));

    const albumSelecionado = idAlbumSelecionado ? pegarAlbumPorId(idAlbumSelecionado) : null;

    return(
        <section className={styles.header}>

            <div className={styles.div_left}>

                <div className={styles.top_albums}>

                    <h1> Top Albums </h1>

                    <div className={styles.top_albums_container}>

                        
                        {albums.slice(0,4).map((album: Album) => (

                            <div key={album.id} className={styles.album_div}>

                                <div className={styles.div_capa}>

                                    <img src={album?.capa_album} alt="Capa do Album" />

                                </div>

                                <h2> {album?.nome} </h2>

                            </div>

                        ))}
                        

                    </div>

                </div>

                <div className={styles.dashboard}>

                    <div className={styles.input_container}>

                        <form onSubmit={handlePesquisa} className={styles.input_div}>

                            <input 
                            type="text" 
                            placeholder='Digite o nome da faixa ou album que deseja'
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}/>

                            <IconContext.Provider value={{size: '30px'}}>
                                <FaMagnifyingGlass />
                            </IconContext.Provider>

                        </form>

                        <div className={styles.radioInputs_container}>

                            <div className={styles.radioInputs}>

                                <label> Albums </label>
                                <input 
                                name="radioInput" 
                                type="radio" 
                                value='albums' 
                                checked={categoriaSelecionada === 'albums'}
                                onChange={() => setCategoriaSelecionada('albums')} />

                            </div>

                            <div className={styles.radioInputs}>

                                <label> Faixas </label>
                                <input 
                                name="radioInput" 
                                type="radio" 
                                value='faixas' 
                                checked={categoriaSelecionada === 'faixas'}
                                onChange={() => setCategoriaSelecionada('faixas')} />

                            </div>

                        </div>

                    </div>


                    <div className={styles.resultados_container}>

                        {categoriaSelecionada === 'faixas' && 
                        filtroFaixas.map((faixa : Faixa) => {

                            const album = pegarAlbumPorId(faixa.album_id)

                            return (

                                <div className={styles.div_resultado} key={faixa.id}>

                                    <div className={styles.info}>

                                        <img src={album?.capa_album} alt="Capa do Album" />

                                        <h2> {faixa?.nome} </h2>

                                    </div>

                                    <div className={styles.opcoes}>

                                        <IconContext.Provider value={{size: '30px', color: 'white'}}>
                                            <CiTrash onClick={() => handleDelete(faixa.id, 'faixa')} />
                                        </IconContext.Provider> 

                                    </div>

                                </div>

                            )

                        })}

                        {categoriaSelecionada === 'albums' && 
                        filtroAlbums.map((album: Album) => (

                            <div key={album.id} className={styles.div_resultado}>

                                <div className={styles.info}>

                                    <img src={album?.capa_album} alt="Capa do Album" />

                                    <h2> {album?.nome} </h2>

                                </div>

                                <div className={styles.opcoes}>

                                    <IconContext.Provider value={{size: '30px', color: 'white'}}>
                                        <CiTrash onClick={() => handleDelete(album.id, 'album')} />
                                    </IconContext.Provider> 

                                    <IconContext.Provider value={{size: '30px', color: 'white'}}>
                                        <FaPlus 
                                        onClick={() => {setMostrarFaixaModal(true), setIdAlbumSelecionado(album.id)}}
                                        />
                                    </IconContext.Provider>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            <div className={styles.div_right}>

                <div className={styles.top_faixas}>

                    <h1> Top Faixas </h1>

                    {faixas.slice(0, 6).map((faixa: Faixa) => {

                        const album = pegarAlbumPorId(faixa.album_id)

                        return (

                            <div key={faixa.id} className={styles.faixa_div}>

                                <img src={album?.capa_album} alt="Capa Album da Faixa" />

                                <h2> {faixa.nome} </h2>

                            </div>

                        )

                    })}

                </div>

            </div>

            {mostrarFaixaModal && (
                <div className={styles.modal_faixa}>
                    <div className={styles.modal_faixa_conteudo}>
                        <h2>Adicionar nova faixa no album {albumSelecionado?.nome}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddFaixa(); }}>
                            <div className={styles.modal_input}>
                                <label htmlFor="faixaNome">Nome da Faixa</label>
                                <input
                                    id="faixaNome"
                                    type="text"
                                    value={novaFaixaNome}
                                    onChange={(e) => setNovaFaixaNome(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={estaCriando}>Adicionar Faixa</button>
                            <button type="button" onClick={() => setMostrarFaixaModal(false)}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

        </section>
    )
}

export default Header