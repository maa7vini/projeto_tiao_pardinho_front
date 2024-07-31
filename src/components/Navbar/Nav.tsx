import styles from './Nav.module.css';

import { useState, useEffect } from 'react';

import { FaPlus } from "react-icons/fa6";

import { IconContext } from 'react-icons';

import api from '../../services/api';

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

function Navbar(){

    const [albums, setAlbums] = useState<Album[]>([]);
    const [faixas, setFaixas] = useState<Faixa[]>([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [pesquisa, setPesquisa] = useState('');
    const [novoAlbumNome, setNovoAlbumNome] = useState('');
    const [novoAlbumCapa, setNovoAlbumCapa] = useState('');
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

    const handleAddAlbum = async () => {

        if(estaCriando) return;

        setEstaCriando(true);
        try {
            const novoAlbum = {nome: novoAlbumNome, capa_album: novoAlbumCapa};
            const response = await api.post('albums', novoAlbum);
            if (response.data.status){
                const albumsResponse = await api.get<ApiResponseAlbums>('albums');
                setAlbums(albumsResponse.data.albums);
                setMostrarModal(false);
                setNovoAlbumNome('');
                setNovoAlbumCapa('');
            }
        }catch(err) {
            console.error('Erro ao adicionar álbum: ', err)
        }finally {
            setEstaCriando(false)
        }
    }

    const filtroAlbums = albums.filter(album => album.nome.toLowerCase().includes(pesquisa.toLowerCase()));
    const filtroFaixas = faixas.filter(faixa => faixa.nome.toLowerCase().includes(pesquisa.toLowerCase()));

    return(
        <nav className={styles.navbar}>

            <h1> Tião Carreiro e Pardinho </h1>

            <div className={styles.novoAlbumBtn}>

                <h1> Adicionar novo album </h1>

                <IconContext.Provider value={{size: '30px', color: 'white'}}>
                    <FaPlus onClick={() => setMostrarModal(true)}/>
                </IconContext.Provider>

            </div>


            {mostrarModal && (
                <div className={styles.modal}>

                    <div className={styles.conteudo_modal}>

                        <h2>Adicionar Novo Album</h2>

                        <input
                            type="text"
                            placeholder="Nome do Album"
                            value={novoAlbumNome}
                            onChange={(e) => setNovoAlbumNome(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Link da Capa do Album"
                            value={novoAlbumCapa}
                            onChange={(e) => setNovoAlbumCapa(e.target.value)}
                        />

                        <button onClick={handleAddAlbum}>Adicionar Faixa </button>

                        <button onClick={() => setMostrarModal(false)}>Cancelar</button>

                    </div>
                </div> 

            )}

        </nav>
    )
}

export default Navbar
